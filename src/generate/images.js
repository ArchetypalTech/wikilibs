import sharp from "sharp";
import FastGlob from "fast-glob";
import { copyFile } from "fs";
const attachments = 'vaults/content/attachments/*.{jpeg,jpg,png,gif}'
const PUBLIC = 'static'
const srcsets = [{
    key: "sm",
    width: 680,
}, {
    key: "md",
    width: 1180,
}, {
    key: "lg",
    width: 1440,
}]
export async function processImages() {
    
    const files = await FastGlob(attachments)
    
    return await Promise.all(files.map(async (path) => {
        
        let group = []
        if(path.includes('.gif')) {
            group.push(processGif(path))
        } else {
            srcsets.forEach((meta) => {
                group.push(resizeImage(path, meta))
            })
        }
        
       await Promise.all(group)
       return Promise.resolve()
    }))
}
function processGif(path) {
    return new Promise(async (resolve, reject) => {
        let target = path.split('/').slice(-1).join('')
        const sanitized = target.split(' ').join('_')
        copyFile(path, `${PUBLIC}/gifs/${sanitized}`, resolve)
    })
}
function resizeImage(path, { width, key }) {
    return new Promise(async (resolve, reject) => {
        const image = await sharp(path);
        image
        .metadata()
        .then((metadata) => {
            // get filename
            let target = path.split('/').slice(-1).join('')
            // strip whitespace
            let sanitized = target.split(' ').join('_').split('.')
            sanitized[sanitized.length - 1] = 'webp';
            const filename = sanitized.join('.')
            
            if (metadata.width > width) image.resize({ width })

            return image
                .webp({ quality: 90 })
                .toFile(`${PUBLIC}/${key}/${filename}`)                    
        })
        .then(resolve);
    })
}


export function markdownImages (md, config) {
    md.renderer.rules.image = function (tokens, idx, options, env, self) {
      config = config || {}
  
      var token = tokens[idx]
      var srcIndex = token.attrIndex('src')
      let url = token.attrs[srcIndex][1]
      
      if(!url.includes('gif')) {
          // switch file type for webp
          let src = url.split('.')
          src[src.length - 1] = 'webp';
          url = src.join('.')
      }
      // align with obsidian wiki links and follow markdown-it 
      // wikilinks rule ' ' === '_'
      // obsidian rule ' ' === '%20'
      url = url.split('%20').join('_')
  
      var title = ''
      var caption = md.utils.escapeHtml(token.content)
  
      // var target = generateTargetAttribute(config.target)
      // var linkClass = generateClass(config.linkClass)
      var imgClass = generateClass(config.imgClass)
      const srcset = genSourceSet(url)
  
      if (token.attrIndex('title') !== -1) {
        title = ' title="' + md.utils.escapeHtml(token.attrs[token.attrIndex('title')][1]) + '"'
      }
        if (!url.includes('gif')) {
            return `<img loading="lazy" ${srcset} src="/sm/${url}" alt="${caption}" ${title} ${imgClass}/>`
        }
    return `<img loading="lazy" src="/gifs/${url}" alt="${caption}" ${title} ${imgClass}/>`
    }
  }
  
  function genSourceSet(url) {
      return `srcset="/${url} ${srcsets.sm}w, /md/${url} ${srcsets.md}w, /lg/${url} ${srcsets.lg}w"`
  }
  
  function generateTargetAttribute (target) {
    target = target || '_self'
  
    return ' target="' + target + '"'
  }
  
  function generateClass (className) {
    if (!className) return ''
  
    return ' class="' + className + '"'
  }