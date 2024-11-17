import path from "path";
import "dotenv/config";
import fs from "fs";
// Make sure to include these imports:
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY!);

export default async function handleAudio({ id }: { id: string }) {
  const mediaPath = path.join(
    import.meta.dirname,
    "../recordings",
    `${id}.ogg`
  );
  const uploadResult = await fileManager.uploadFile(mediaPath, {
    mimeType: "audio/ogg",
    displayName: "received recording file",
  });
  // View the response.
  console.log(
    `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  );

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
    { text: "Summarize this speech." },
  ]);
  await fileManager.deleteFile(uploadResult.file.name);
  await fs.promises.rm(mediaPath);
  console.log(result.response.text());
  return result.response.text();
}
