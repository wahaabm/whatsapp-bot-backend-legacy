import fs from 'fs';
import path from 'path';
import fastify from 'fastify';
import fastifySocket from 'fastify-socket.io';
import cors from '@fastify/cors';
import Whatsapp from 'whatsapp-web.js';
const { Client, LocalAuth, NoAuth } = Whatsapp;
import WAWebJS from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import CleanAuthCache from '../utils/cleanAuthCache.js';
import handleImage from '../utils/handleImage.js';
import handleAudio from '../utils/handleAudio.js';
import type { FastifyCookieOptions } from '@fastify/cookie';
import cookie from '@fastify/cookie';

const server = fastify({
    logger: false
});

server.register(cookie, {
    secret: 'xyz', // for cookies signature
    parseOptions: {} // options for parsing cookies
} as FastifyCookieOptions);

server.register(fastifySocket.default, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

server.register(cors, {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
});

const prisma = new PrismaClient();

const clients: { [key: string]: typeof Client.prototype } = {}; // Store active clients
const connectedSockets: { [key: string]: string } = {};

// Helper function to generate a unique clientId
const generateClientId = () => {
    return `client-${Date.now()}`;
};

const initializeClient = async (clientId: string) => {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId }),
        puppeteer: {
            headless: true
        }
    });

    clients[clientId] = client;
    let qrCode = '';
    const socketId = connectedSockets[clientId]; // Map clientId to socketId
    console.log('In initialize client, socketid is ', socketId);
    client.on('ready', () => {
        console.log(`Client ${clientId} is ready!`);
        console.log('sending to socket id', socketId);
        server.io.to(socketId!).emit('clientReady');
    });

    client.on('qr', (qr) => {
        qrCode = qr;
        const socketId = connectedSockets[clientId]; // Map clientId to socketId
        if (socketId) {
            server.io.to(socketId).emit('qrCode', { qr }); // Send QR to the specific client
        }
        qrcode.generate(qr, { small: true });
    });

    client.on('message', async (msg: WAWebJS.Message) => {
        if (msg.isStatus || msg.broadcast || msg.from.includes('newsletter'))
            return;
        let mediaPromptResponse = null;
        let message = null;

        if (msg.type === 'image') {
            const media = await msg.downloadMedia();
            const dir = './media';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const filePath = path.join(dir, `${msg.id.id}.jpeg`);

            await fs.promises.writeFile(filePath, media.data, 'base64'); // Assuming media.data is base64
            mediaPromptResponse = await handleImage({ id: msg.id.id });
        }

        if (msg.type === 'ptt') {
            const media = await msg.downloadMedia();
            const dir = './recordings';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const filePath = path.join(dir, `${msg.id.id}.ogg`);

            await fs.promises.writeFile(filePath, media.data, 'base64'); // Assuming media.data is base64
            mediaPromptResponse = await handleAudio({ id: msg.id.id });
        }

        const sender = msg.from;

        if (msg.type === 'image') {
            message = `An image which as description : ${mediaPromptResponse}
      and caption by sender: ${msg.body}`;
        } else if (msg.type === 'ptt') {
            message = `A voice note which as description : ${mediaPromptResponse}`;
        } else {
            message = msg.body;
        }
        const messageId = msg.id.id;
        const recipient = msg.to;
        const chat = await msg.getChat();
        let authorContact;

        if (chat.isGroup) {
            authorContact = await client.getContactById(msg.author!);
        }

        const chatId = chat.id.user;
        const chatName = chat.name;
        const contact = await client.getContactById(sender);
        const recipientContact = await client.getContactById(recipient);

        try {
            const userRecord = prisma.user.upsert({
                where: { id: client.info.wid.user },
                update: {},
                create: {
                    id: client.info.wid.user
                }
            });

            const senderRecord = prisma.contact.upsert({
                where: {
                    id: chat.isGroup ? authorContact?.id.user : contact.id.user
                },
                update: {},
                create: {
                    id: chat.isGroup ? authorContact!.id.user : contact.id.user,

                    name: chat.isGroup
                        ? authorContact!.pushname
                        : contact.pushname ?? 'Unknown',
                    phone: chat.isGroup
                        ? authorContact?.number
                        : recipientContact.number
                }
            });

            const receiverRecord = prisma.contact.upsert({
                where: { id: recipientContact.id.user },
                update: {},
                create: {
                    id: recipientContact.id.user,
                    name: chat.isGroup
                        ? recipientContact.name ?? 'Unknown'
                        : recipientContact.pushname ?? 'Unknown',
                    phone: chat.isGroup
                        ? authorContact?.number
                        : recipientContact.number
                }
            });

            const chatRecord = prisma.chat.upsert({
                where: { id: chatId },
                update: {},
                create: {
                    id: chatId,
                    name: chatName ?? 'Unnamed Chat',
                    userId: client.info.wid.user
                }
            });

            const messageRecord = prisma.message.create({
                data: {
                    id: messageId,
                    content: message,
                    senderId: chat.isGroup
                        ? authorContact!.id.user
                        : contact.id.user,
                    receiverId: recipientContact.id.user,
                    chatId: chatId
                }
            });

            await prisma.$transaction([
                userRecord,
                senderRecord,
                receiverRecord,
                chatRecord,
                messageRecord
            ]);
            server.io.emit('databaseUpdated');
            console.log('Message inserted successfully!');
        } catch (error) {
            console.error('Error inserting message:', error);
        }
    });

    client.on('message_create', async (msg: WAWebJS.Message) => {
        if (!msg.fromMe) return;

        if (msg.isStatus || msg.broadcast || msg.from.includes('newsletter'))
            return;
        let mediaPromptResponse = null;
        let message = null;

        if (msg.type === 'image') {
            const media = await msg.downloadMedia();
            const dir = './media';

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const filePath = path.join(dir, `${msg.id.id}.jpeg`);
            await fs.promises.writeFile(filePath, media.data, 'base64');
            mediaPromptResponse = await handleImage({ id: msg.id.id });
        }

        if (msg.type === 'ptt') {
            const media = await msg.downloadMedia();
            const dir = './recordings';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const filePath = path.join(dir, `${msg.id.id}.ogg`);
            await fs.promises.writeFile(filePath, media.data, 'base64');
            mediaPromptResponse = await handleAudio({ id: msg.id.id });
        }

        const sender = msg.from;
        if (msg.type === 'image') {
            message = `An image which as description : ${mediaPromptResponse}
      and caption by sender: ${msg.body}`;
        } else if (msg.type === 'ptt') {
            message = `A voice note which as description : ${mediaPromptResponse}
      and caption by sender: ${msg.body}`;
        } else {
            message = msg.body;
        }

        const messageId = msg.id.id;
        const recipient = msg.to;
        const chat = await msg.getChat();

        const chatId = chat.id.user;
        const chatName = chat.name;

        const contact = await client.getContactById(sender);
        const recipientContact = await client.getContactById(recipient);

        try {
            const userRecord = prisma.user.upsert({
                where: { id: client.info.wid.user },
                update: {},
                create: {
                    id: client.info.wid.user
                }
            });

            const senderRecord = prisma.contact.upsert({
                where: { id: contact.id.user },
                update: {},
                create: {
                    id: contact.id.user,
                    name: contact.pushname ?? 'Unknown',
                    phone: contact.number
                }
            });

            const receiverRecord = prisma.contact.upsert({
                where: { id: recipientContact.id.user },
                update: {},
                create: {
                    id: recipientContact.id.user,
                    name: chat.isGroup
                        ? recipientContact.name ?? 'Unknown'
                        : recipientContact.pushname ?? 'Unknown',
                    phone: recipientContact.number
                }
            });

            const chatRecord = prisma.chat.upsert({
                where: { id: chatId },
                update: {},
                create: {
                    id: chatId,
                    name: chatName ?? 'Unnamed Chat',
                    userId: client.info.wid.user
                }
            });

            const messageRecord = prisma.message.create({
                data: {
                    id: messageId,
                    content: message,
                    senderId: contact.id.user,
                    receiverId: chat.isGroup
                        ? chatId
                        : recipientContact.id.user,
                    chatId: chatId
                }
            });

            await prisma.$transaction([
                userRecord,
                senderRecord,
                receiverRecord,
                chatRecord,
                messageRecord
            ]);

            server.io.emit('databaseUpdated');
            console.log('Message inserted successfully!');
        } catch (error) {
            console.error('Error inserting message:', error);
        }
    });

    await client.initialize();

    return { clientId, qrCode }; // Return clientId and QR code to the frontend
};

//Previous one
// server.post('/initClient', async (request, reply) => {
//     console.log('Request for initialzing client');
//     const newClientId = generateClientId();
//     const { clientId, qrCode } = await initializeClient(newClientId);

//     return reply
//         .setCookie('clientId', clientId, {
//             path: '/',
//             secure: false,
//             sameSite: 'lax',
//             httpOnly: true
//         })
//         .header('Content-Type', 'application/json')
//         .status(200)
//         .send({ qrCode, clientId }); // Return the QR code and clientId to the frontend
// });

// Adjust the /initClient route
server.post('/initClient', async (req, reply) => {
    let clientId = req.cookies.clientId;

    // If no clientId exists in the cookies, generate a new one
    if (!clientId) {
        clientId = generateClientId();
        reply.setCookie('clientId', clientId, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        });
    }

    // We should not initialize the client here anymore
    return reply.send({ clientId }); // Return only clientId and let the socket handle initialization
});
server.get('/status', async (request, reply) => {
    const clientId = request.cookies.clientId;
    if (!clientId) {
        return reply
            .header('Content-Type', 'application/json')
            .status(200)
            .send({ status: 'disconnected' });
    }
    const client = clients[clientId];
    if (!client) {
        return reply
            .header('Content-Type', 'application/json')
            .status(200)
            .send({ status: 'disconnected' });
    }
    const clientState = await client.getState();
    console.log({ clientState });
    return reply
        .header('Content-Type', 'application/json')
        .status(200)
        .send({ clientState: clientState });
});

server.get('/getClientId/:sessionId', async (request: any, reply) => {
    const { sessionId } = request.params;
    console.log('Requesting client id ', sessionId);
    if (!sessionId) {
        return reply
            .header('Content-Type', 'application/json')
            .status(200)
            .send({ clientId: null });
    }
    const client = clients[sessionId];
    if (!client) {
        return reply
            .header('Content-Type', 'application/json')
            .status(200)
            .send({ clientId: null });
    }
    return reply
        .header('Content-Type', 'application/json')
        .status(200)
        .send({ clientId: client.info.wid.user });
});

server.get('/getProfilePic/:id', async (request: any, reply) => {
    const clientId = request.cookies.clientId;
    if (!clientId) {
        return reply
            .header('Content-Type', 'application/json')
            .status(401)
            .send({ message: 'Unauthorized' });
    }
    const client = clients[clientId];
    if (!client) {
        return reply
            .header('Content-Type', 'application/json')
            .status(401)
            .send({ message: 'Unauthorized' });
    }

    console.log(request.params.id);
    if (request.params.id == 'loggedInUser@c.us') {
        console.log('here');
        const picURL = await client.getProfilePicUrl(
            client.info.wid._serialized
        );
        return reply
            .header('Content-Type', 'application/json')
            .status(200)
            .send({ profilePic: picURL });
    }
    const contact = await client.getContactById(request.params.id);
    const picURL = await contact.getProfilePicUrl();

    return reply
        .header('Content-Type', 'application/json')
        .status(200)
        .send({ profilePic: picURL });
});

server.get('/logout', async (request, reply) => {
    const clientId = request.cookies.clientId;
    if (!clientId) {
        return reply
            .header('Content-Type', 'application/json')
            .status(401)
            .send({ message: 'Unauthorized' });
    }
    const client = clients[clientId];
    if (!client) {
        return reply
            .header('Content-Type', 'application/json')
            .status(401)
            .send({ message: 'Unauthorized' });
    }
    await client.logout();
    await client.destroy();
    delete clients[clientId];

    // Clear the clientId cookie
    return reply
        .clearCookie('clientId', {
            path: '/',
            secure: false,
            sameSite: 'lax',
            httpOnly: true
        })
        .status(200)
        .send({ message: 'Logged out successfully' });
});

server.ready((err) => {
    if (err) throw err;

    // Inside the socket connection handler
    server.io.on('connection', (socket: any) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on('registerClient', async (clientId: string) => {
            console.log(`Registering client: ${clientId}`);
            connectedSockets[clientId] = socket.id;
            console.log('Connected sockets', connectedSockets);

            // Initialize the client right after registration
            const { qrCode } = await initializeClient(clientId);
            socket.emit('clientInitialized', { qrCode, clientId }); // Emit QR code back to the client
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            for (const clientId in connectedSockets) {
                if (connectedSockets[clientId] === socket.id) {
                    delete connectedSockets[clientId];
                }
            }
        });
    });
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});

declare module 'fastify' {
    interface FastifyInstance {
        io: Server;
    }
}
