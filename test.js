import FastGlob from 'fast-glob';
import { generateWiki } from "./dist/main.js";
// import { buildMenuTree } from "./src/generate/debug.js";
// generateWiki('static/gifs')
// const MD_CONTENT = 'vaults/content/**/*.md'
// // buildMenuTree()

// const files1 = await glob(MD_CONTENT);
// const files2 = await FastGlob(MD_CONTENT);

// console.log('glob',files1)
// console.log('fast-glob',files2)

generateWiki()