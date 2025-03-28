// @ts-nocheck
import { processImages } from "./generate/images.ts";
import {
  processMarkdown,
  processRoutes,
  buildMenuTree,
} from "./generate/index.ts";
import { buildMenuTree } from "./generate/index.ts";

import { mkdirSync, existsSync, writeFileSync } from "fs";
export async function generateWiki() {
  // await processImages();
  await processMarkdown();
  await processRoutes();
  // await buildMenuTree();
}

export function prepareDirectoryStructure() {
  createDirectory("vaults/content/attachments");
  createDirectory("static/gifs");
  createDirectory("static/sm");
  createDirectory("static/md");
  createDirectory("static/lg");
  createDirectory("src/content");
  createDirectory("src/lib/data");
  createFile("src/lib/data/menu.js", JSON.stringify([], null, 2));
  createFile("src/lib/data/routes.js", JSON.stringify({}, null, 2));
}

function createFile(path: string, content: string) {
  if (!existsSync(path)) writeFileSync(path, `export default ${content}`);
}
function createDirectory(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}
