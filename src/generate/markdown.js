import markdownit from "markdown-it";
import { markdownImages } from "./images.js";
import { full as emoji } from 'markdown-it-emoji'
import markdownItWikilinks from "@ig3/markdown-it-wikilinks";
import highlightjs from 'markdown-it-highlightjs';
import { tasklist } from "@mdit/plugin-tasklist";
import anchors from 'markdown-it-anchor'

const wikilinkOptions = {
    htmlAttributes: {'data-wiki': false},
    uriSuffix :'',
    makeAllLinksAbsolute: true,
}

export default markdownit()
    .use(emoji)
    .use(anchors)
    .use(tasklist)
    .use(markdownItWikilinks(wikilinkOptions))
    .use(markdownImages)
    .use(highlightjs)
