import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

export default async function CleanAuthCache() {
  debugger;
  const foldersToDelete = [".wwebjs_auth", ".wwebjs_cache"];
  for (const folder of foldersToDelete) {
    const path = fileURLToPath(new URL(`../${folder}`, import.meta.url));
    try {
      await fs.rm(path, { recursive: true, force: true });
    } catch (error) {
      console.log(error);
    }
  }
}
