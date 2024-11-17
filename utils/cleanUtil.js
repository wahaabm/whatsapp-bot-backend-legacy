import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate the root directory by going up two levels
const rootDir = path.resolve(__dirname, "..");

// List of folders to delete in the root directory
const foldersToDelete = [".wwebjs_auth", ".wwebjs_cache"];

// Iterate over the folders to delete
foldersToDelete.forEach((folder) => {
  const folderPath = path.join(rootDir, folder);

  // Check if the folder exists and delete it
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true }); // Use fs.rmSync for deleting directories
    console.log(`Deleted folder: ${folderPath}`);
  } else {
    console.log(`Folder does not exist: ${folderPath}`);
  }
});
