// @ts-nocheck
import { readFileSync, writeFile, mkdirSync, existsSync, stat } from "fs";

import FastGlob from "fast-glob";
import md from "./markdown.ts";
import parseFrontMatter from "./frontmatter.ts";
import { linkify, cleanDoubleLinks, purifyHTMLEntities } from "./linkify.ts";
import config from "./config.ts";

const ROUTE_DATA = "src/lib/data";
const MD_CONTENT = "vaults/content";
const HTML_CONTENT = "src/content";

// Markdown init & plugins
export async function processMarkdown() {
    const files = await FastGlob(`${MD_CONTENT}/**/*.md`);
    return Promise.all(
        files.map((filepath) => {
            return new Promise(async (resolve, reject) => {
                const { slug, path } = sanitizePath(filepath);
                const lastModified = await getLastModified(filepath);

                if (!requiresUpdate(slug, lastModified)) return resolve();

                const data = readFileSync(filepath, "utf-8");
                let { content, frontmatter } = await parseFrontMatter(data);
                content = updateObsidianImageFormat(content);
                content = linkify(content);
                let html = md.render(content);
                html = cleanDoubleLinks(html);
                html = purifyHTMLEntities(html);
                html = updateObsidianLinksWithTags(html);

                const { build, route } = await getBuildPath(path, slug);

                config.PROPS[route] = {
                    lastModified,
                    slug,
                    route,
                    label: config.ORIGINALS[slug],
                    wiki: config.ORIGINALS[slug].split(" ").join("_"),
                    published:
                        frontmatter?.published === "false" ? false : true,
                    frontmatter,
                };
                await writeFile(build, html, () => resolve());
            });
        })
    );
}

function requiresUpdate({ slug }, lastModified) {
    if (!config.CACHE) config.CACHE = {};
    return config.CACHE[slug]?.lastModified !== lastModified;
}

function getLastModified(filepath) {
    return new Promise((res, rej) => {
        stat(filepath, (err, stats) => {
            if (err) rej(err);
            res(stats.mtime.toISOString());
        });
    });
}

/**
 *
 * @param {content} string page content
 * switches from ![[path]] to ![path](path)
 * @returns updated markdown
 */
function updateObsidianImageFormat(content) {
    let customMarkdown = content;
    const REGEX_RULE = /!\[\[(.+?\..+?)\]\]/g;
    const obsidianImages = content.match(REGEX_RULE);
    const images = obsidianImages?.map((img) => {
        const path = img.split("![[")[1].split("]]")[0];
        return {
            path,
            target: img,
            markdown: `![${path}](${path})`,
        };
    });
    images?.forEach(async (img) => {
        customMarkdown = customMarkdown.replace(img.target, img.markdown);
    });
    return customMarkdown;
}
function updateObsidianLinksWithTags(content) {
    let customMarkdown = content;
    const REGEX_RULE = /(\[\[(?:(.+?)\|)?(.+?)\]\])/g;
    const obsidianLinks = content.match(REGEX_RULE);
    const links = obsidianLinks?.map((text) => {
        const path = text.split("[[")[1].split("]]")[0];
        const [label, anchor] = path.split("#");
        let [href, smartLabel] = label.split("|");
        if (href) href = href.trim();
        return {
            path,
            target: text,
            html: `<a data-wiki="${
                (anchor && kebabme(anchor)) || "false"
            }" href="/${kebabme(href ? href : label)}">${
                smartLabel ? smartLabel : label
            }</a>`,
        };
    });
    links?.forEach(async (img) => {
        customMarkdown = customMarkdown.replace(img.target, img.html);
    });
    return customMarkdown;
}

export async function processRoutes() {
    // console.log(config.ORIGINALS);
    // update cache
    Object.values(config.PROPS).forEach(
        (update) => (config.CACHE[update.route] = update)
    );
    // console.log(config.CACHE);
    // save config.cache - actually gets built from empty each time due to dockerfile
    await writeModule(config.CACHE, "routes");
}

export async function buildMenuTree() {
    let menu = [];

    Object.entries(config.CACHE).forEach(([path, item], i) => {
        const paths = path.split("/");
        const id = paths.pop();
        const label = config.ORIGINALS[id];
        const file = {
            id,
            label,
            link: `${item.route}`,
            published: item.published,
        };

        buildTree(menu, paths, file, true);
    });
    await writeModule(menu, `menu`);
}

async function writeModule(data, filename = "tbc") {
    const module = `export default ${JSON.stringify(data, null, 2)}`;
    await writeFile(
        `./${ROUTE_DATA}/${filename}.js`,
        module,
        (err) => err && console.log(err)
    );
    return Promise.resolve();
}

async function getBuildPath(path, slug) {
    const buildPath = [HTML_CONTENT, ...path].join("/");

    if (!existsSync(buildPath)) mkdirSync(buildPath, { recursive: true });

    return {
        route: `${[...path, slug].join("/")}`,
        build: `${buildPath}/${slug}.html`,
    };
}

function sanitizePath(filepath) {
    // remove [vaults, content] -> 2
    let path = filepath.split("/").splice(2);

    let dirname = path.pop();
    let slug = sluggify(dirname);
    let cleanedPaths = path.map(sluggify);

    return { slug, path: cleanedPaths };
}

function kebabme(file) {
    file = file.includes(" ")
        ? file.split(" ").join("-")
        : file.includes("_")
        ? file.split("_").join("-")
        : file;
    return file.toLowerCase();
}

function sluggify(file) {
    if (file.includes(".md")) file = file.slice(0, -3);
    const label = file;
    file = file.includes(" ")
        ? file.split(" ").join("-")
        : file.includes("_")
        ? file.split("_").join("-")
        : file;
    const slug = file.toLowerCase();

    config.ORIGINALS[slug] = label;

    return slug;
}

function buildTree(entry, paths, file, isRoot = false) {
    const node = isRoot ? entry : entry.children;
    if (!file.published) return;
    if (!paths.length) return node.push(file);

    const targetDirectory = paths.shift();
    let next = node.find(({ id }) => id === targetDirectory);
    if (!next) {
        node.push({
            id: targetDirectory,
            label: config.ORIGINALS[targetDirectory],
            children: [],
        });
        next = node.find(({ id }) => id === targetDirectory);
    }
    buildTree(next, paths, file);
}
