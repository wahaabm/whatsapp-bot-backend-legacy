import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function chat1() {
  // Create a user
  const user = await prisma.user.upsert({
    where: { id: "user123" },
    update: {},
    create: {
      id: "user123",
    },
  });

  // Create two contacts (sender and receiver)
  const sender = await prisma.contact.upsert({
    where: { id: "sender123" },
    update: {},
    create: {
      id: "sender123",
      name: "Alice",
      phone: "1234567890",
    },
  });

  const receiver = await prisma.contact.upsert({
    where: { id: "receiver123" },
    update: {},
    create: {
      id: "receiver123",
      name: "Bob",
      phone: "0987654321",
    },
  });

  // Create a chat
  const chat = await prisma.chat.upsert({
    where: { id: "chat123" },
    update: {},
    create: {
      id: "chat123",
      name: "General Chat",
      userId: "923309185920",
    },
  });

  const messages: {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    chatId: string;
    createdAt: Date;
  }[] = [];

  const randomMessages = [
    "Hey, how's it going?",
    "Did you finish the project?",
    "Let's grab lunch sometime.",
    "What do you think about the new update?",
    "I'll get back to you on that.",
    "Good morning!",
    "How's the weather over there?",
    "Can we reschedule the meeting?",
    "Are you free this weekend?",
    "Looking forward to the event.",
    "Let me know if you need anything.",
    "Catch you later!",
    "I’ll send over the details.",
    "What’s your opinion on this?",
    "Did you watch the game last night?",
    "Sounds good to me!",
    "Thanks for the update.",
    "I’ll follow up with them.",
    "Have you heard the news?",
    "I’m on my way.",
    "Sure, that works for me.",
    "Let’s do it.",
    "I’ll be there in 10 minutes.",
    "Can you review this document?",
    "We should plan something soon.",
    "Nice to hear from you!",
    "I’ll see you tomorrow.",
    "Let’s meet at the usual spot.",
    "I’m excited about the new project.",
    "That was a great discussion!",
  ];

  for (let i = 1; i <= 30; i++) {
    const randomMessage =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const alternatingSender = i % 2 === 0 ? sender.id : receiver.id;
    const alternatingReceiver = i % 2 === 0 ? receiver.id : sender.id;

    messages.push({
      id: `message${i}`,
      content: randomMessage,
      senderId: alternatingSender,
      receiverId: alternatingReceiver,
      chatId: chat.id,
      createdAt: new Date(Date.now() - i * 60000), // Each message 1 minute apart
    });
  }

  await prisma.message.createMany({
    data: messages,
  });

  console.log("Seed completed successfully for chat1.");
}

async function chat2() {
  // Create two contacts (sender and receiver)
  const sender = await prisma.contact.upsert({
    where: { id: "senderChat2" },
    update: {},
    create: {
      id: "senderChat2",
      name: "Charlie",
      phone: "5551112222",
    },
  });

  const receiver = await prisma.contact.upsert({
    where: { id: "recieverChat2" },
    update: {},
    create: {
      id: "recieverChat2",
      name: "David",
      phone: "5553334444",
    },
  });

  // Create a chat
  const chat = await prisma.chat.upsert({
    where: { id: "Chat456" },
    update: {},
    create: {
      id: "chat456",
      name: "Project Chat",
      userId: "923309185920",
    },
  });

  const messages: {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    chatId: string;
    createdAt: Date;
  }[] = [];

  const randomMessages = [
    "Hey, did you get the files?",
    "The deadline is approaching fast.",
    "I'll make the changes you suggested.",
    "How's the client feedback?",
    "Let's sync up on the presentation.",
    "I'll be late for the meeting today.",
    "Can you review the final draft?",
    "We need to revise the strategy.",
    "Have you sent the email to the team?",
    "The numbers don't look good, need a second opinion.",
    "I'm working on the budget right now.",
    "Let’s aim for the final delivery by tomorrow.",
    "Check out the new mockups I uploaded.",
    "We need to push the timeline by a week.",
    "Let’s confirm with the client about the new feature.",
    "Great job on the demo!",
    "Let me know if you need more resources.",
    "I’ll prepare the follow-up document.",
    "How do you feel about this new direction?",
    "I’ll get back to you with an update shortly.",
    "Can we adjust the focus for the next sprint?",
    "Please verify the changes in the repository.",
    "Let's finalize the proposal today.",
    "I'll need some help on the testing phase.",
    "We should present the progress to the board.",
    "Do you have the latest project updates?",
    "Let’s do a quick team call later today.",
    "I’m almost done with the review process.",
    "Can we rework the UI a bit?",
    "Let’s have a wrap-up meeting tomorrow morning.",
  ];

  for (let i = 1; i <= 30; i++) {
    const randomMessage =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const alternatingSender = i % 2 === 0 ? sender.id : receiver.id;
    const alternatingReceiver = i % 2 === 0 ? receiver.id : sender.id;

    messages.push({
      id: `chat2_message${i}`,
      content: randomMessage,
      senderId: alternatingSender,
      receiverId: alternatingReceiver,
      chatId: chat.id,
      createdAt: new Date(Date.now() - i * 60000), // Each message 1 minute apart
    });
  }

  await prisma.message.createMany({
    data: messages,
  });

  console.log("Seed completed successfully for chat2.");
}

async function chat3() {
  // Create a user
  const user = await prisma.user.upsert({
    where: { id: "user789" },
    update: {},
    create: {
      id: "user789",
    },
  });

  // Create two contacts (sender and receiver)
  const sender = await prisma.contact.upsert({
    where: { id: "senderChat3" },
    update: {},
    create: {
      id: "senderChat3",
      name: "Eve",
      phone: "5555556666",
    },
  });

  const receiver = await prisma.contact.upsert({
    where: { id: "receiverChat3" },
    update: {},
    create: {
      id: "receiverChat3",
      name: "Frank",
      phone: "5557778888",
    },
  });

  // Create a chat
  const chat = await prisma.chat.upsert({
    where: { id: "chat789" },
    update: {},
    create: {
      id: "chat789",
      name: "Casual Chat",
      userId: "923309185920",
    },
  });

  const messages: {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    chatId: string;
    createdAt: Date;
  }[] = [];

  const randomMessages = [
    "Did you catch the new movie?",
    "Let’s plan a trip next weekend!",
    "I just tried a new recipe, it's amazing!",
    "How was your weekend?",
    "Can you believe the news today?",
    "I need a book recommendation, any ideas?",
    "I'm thinking of starting a new hobby.",
    "That concert was incredible!",
    "What's the plan for tonight?",
    "Did you see the latest episode?",
    "I’m heading out for a walk, want to join?",
    "How's your new job going?",
    "Let’s grab some coffee this afternoon.",
    "I just finished an amazing novel.",
    "Have you ever been to that new restaurant?",
    "I’m planning a surprise party for Sam.",
    "It’s been a while, let’s catch up!",
    "Have you tried that new game?",
    "I'm thinking about learning photography.",
    "What’s your favorite travel destination?",
    "Let’s go hiking this weekend!",
    "Can’t believe it’s already October!",
    "I’ve been binge-watching a new series.",
    "I just adopted a puppy!",
    "Are you free for lunch tomorrow?",
    "That was such a fun evening!",
    "Have you tried this fitness app?",
    "Let’s meet up after work!",
    "I’ve been exploring new music genres.",
    "What’s your favorite pizza topping?",
  ];

  for (let i = 1; i <= 30; i++) {
    const randomMessage =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const alternatingSender = i % 2 === 0 ? sender.id : receiver.id;
    const alternatingReceiver = i % 2 === 0 ? receiver.id : sender.id;

    messages.push({
      id: `chat3_message${i}`,
      content: randomMessage,
      senderId: alternatingSender,
      receiverId: alternatingReceiver,
      chatId: chat.id,
      createdAt: new Date(Date.now() - i * 60000), // Each message 1 minute apart
    });
  }

  await prisma.message.createMany({
    data: messages,
  });

  console.log("Seed completed successfully for chat3.");
}

async function chat4() {
  // Create two contacts (sender and receiver)
  const sender = await prisma.contact.upsert({
    where: { id: "senderChat4" },
    update: {},
    create: {
      id: "senderChat4",
      name: "Charlie",
      phone: "5553332222",
    },
  });

  const receiver = await prisma.contact.upsert({
    where: { id: "receiverChat4" },
    update: {},
    create: {
      id: "receiverChat4",
      name: "Dana",
      phone: "5558889999",
    },
  });

  // Create a chat
  const chat = await prisma.chat.upsert({
    where: { id: "chat444" },
    update: {},
    create: {
      id: "chat444",
      name: "Work Chat",
      userId: "923309185920",
    },
  });

  const messages: {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    chatId: string;
    createdAt: Date;
  }[] = [];

  const randomMessages = [
    "Let’s finalize the report by Friday.",
    "Can you check the latest figures?",
    "Have you reviewed the project plan?",
    "We need to schedule a team meeting.",
    "The client is asking for updates.",
    "I’m working on the presentation slides.",
    "We should brainstorm some new ideas.",
    "Let’s discuss the next quarter’s targets.",
    "Can you send me the updated document?",
    "I’ll loop you in on the email thread.",
    "The deadline is approaching fast!",
    "I’ve completed the task, please review.",
    "Let’s collaborate on this project.",
    "Can you update the status in the system?",
    "We’re expecting feedback from the client.",
    "I’ll send the meeting invite shortly.",
    "Let’s make sure we hit all the KPIs.",
    "Can you assist with the report analysis?",
    "Have you finished the monthly report?",
    "The budget proposal looks good to me.",
    "We need to adjust the timeline.",
    "I’ll handle the client call today.",
    "The team did a great job on this project.",
    "Let’s schedule a review session tomorrow.",
    "We need to finalize the strategy document.",
    "I’m adding the final touches to the report.",
    "What are the key takeaways from the meeting?",
    "Let’s sync up later to discuss progress.",
    "We should revisit the marketing plan.",
    "I’ll share the updated files soon.",
  ];

  for (let i = 1; i <= 30; i++) {
    const randomMessage =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const alternatingSender = i % 2 === 0 ? sender.id : receiver.id;
    const alternatingReceiver = i % 2 === 0 ? receiver.id : sender.id;

    messages.push({
      id: `chat4_message${i}`,
      content: randomMessage,
      senderId: alternatingSender,
      receiverId: alternatingReceiver,
      chatId: chat.id,
      createdAt: new Date(Date.now() - i * 60000), // Each message 1 minute apart
    });
  }

  await prisma.message.createMany({
    data: messages,
  });

  console.log("Seed completed successfully for chat4.");
}

async function chat5() {
  // Create a user

  // Create two contacts (sender and receiver)
  const sender = await prisma.contact.upsert({
    where: { id: "senderChat5" },
    update: {},
    create: {
      id: "senderChat5",
      name: "Eve",
      phone: "5551112222",
    },
  });

  const receiver = await prisma.contact.upsert({
    where: { id: "receiverChat5" },
    update: {},
    create: {
      id: "receiverChat5",
      name: "Frank",
      phone: "5554443333",
    },
  });

  // Create a chat
  const chat = await prisma.chat.upsert({
    where: { id: "chat777" },
    update: {},
    create: {
      id: "chat777",
      name: "Friend Chat",
      userId: "923309185920",
    },
  });

  const messages: {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    chatId: string;
    createdAt: Date;
  }[] = [];

  const randomMessages = [
    "What are your plans for the weekend?",
    "Did you see the latest movie?",
    "I just got a new puppy!",
    "Let’s catch up over coffee.",
    "Have you tried that new restaurant?",
    "I can’t wait for the concert next week!",
    "What’s your favorite book right now?",
    "I’m thinking about going hiking.",
    "Did you finish that series we talked about?",
    "Let’s plan a game night soon!",
    "How’s your family doing?",
    "I’ve been cooking a lot lately, any recipes to share?",
    "We should take a trip together sometime.",
    "What’s your favorite way to relax?",
    "I heard about that new park opening up.",
    "Do you want to go for a walk later?",
    "I’ll bring snacks for our movie night!",
    "Let’s go to the beach this summer!",
    "What was the highlight of your week?",
    "I tried a new hobby; it’s really fun!",
    "Can you help me with my project this weekend?",
    "Have you been watching any good shows?",
    "I’m excited for our next adventure!",
    "What’s something new you want to try?",
    "Let’s have a barbecue this weekend!",
    "I missed our last meetup; we need to reschedule.",
    "What’s your go-to comfort food?",
    "Are you still working on your fitness goals?",
    "Let’s take a day trip somewhere!",
    "How do you usually celebrate your birthday?",
  ];

  for (let i = 1; i <= 30; i++) {
    const randomMessage =
      randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const alternatingSender = i % 2 === 0 ? sender.id : receiver.id;
    const alternatingReceiver = i % 2 === 0 ? receiver.id : sender.id;

    messages.push({
      id: `chat5_message${i}`,
      content: randomMessage,
      senderId: alternatingSender,
      receiverId: alternatingReceiver,
      chatId: chat.id,
      createdAt: new Date(Date.now() - i * 60000), // Each message 1 minute apart
    });
  }

  await prisma.message.createMany({
    data: messages,
  });

  console.log("Seed completed successfully for chat5.");
}

async function main() {
  await chat1();
  await chat2();
  await chat3();
  await chat4();
  await chat5();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
