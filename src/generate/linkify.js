
/**
 * Replace URLs in text with markdown links
 * (this is used in a migration script so it has to be Node-compat ES6 only)
 */
export function linkify(text /*: string*/ /*: string*/) {
  const PLAIN_URLS = /(?<!\]\()https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  const MARKDOWN_LINKS = /\[(.*?)\]\((https?:\/\/.*?)\)/g;
  
  const allMatches = text.match(PLAIN_URLS) || [];
  const ignoreMatches = [...text.matchAll(MARKDOWN_LINKS)].map(match => match[2]);
  const matches = allMatches.filter(link => ignoreMatches.includes(link));
  // console.log(allMatches)
  // No match, return the text
  if (!matches.length) return text;

  // Build up the result
  matches.forEach(match => {
    const markdownLink = `[${match}](${match})`;
    text = text.replaceAll(match, markdownLink);
  })
  return text;
};

/** 
 * remove the double markdown links 
 * eg: href="%5Bhttps://book.getfoundry.sh/getting-started/installation%5D(https://book.getfoundry.sh/getting-started/installation)"
 * */ 

export function cleanDoubleLinks(html) {
  html = html.replaceAll(/%5B/g, "")  
  html = html.replaceAll(/%5D([^"']*?\))/g, "")
  return html  
}
  