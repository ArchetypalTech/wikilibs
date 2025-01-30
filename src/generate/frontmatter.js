export default async function(text, delimiter = "---") {
    const lines = text.split("\n")
    let frontmatter = false
    let startIndex = null
    let endIndex = null
    let i = 0
    // extract frontmatter
    while (i < lines.length) {
        const line = lines[i].trim()
        const startingLine = lines[0].trim()
        const startIsTruthy = typeof startIndex === "number"
        const endIsTruthy = typeof endIndex === "number"

        if(!startIsTruthy && startingLine.includes(delimiter)) startIndex = 0
        if(startIndex !== i && !endIsTruthy && line.includes(delimiter)) endIndex = i
        if(startIsTruthy && endIsTruthy) {
            frontmatter = {}
            break
        }
        i++
    }
    if(!frontmatter) return Promise.resolve({ content: text })
    // format frontmatter
    const data = lines.slice(startIndex + 1, endIndex)
    data.forEach((keyval) => {
        let [key, value] = keyval.split(":")
        value = value.trim()
        if(value.includes('[') && value.includes(']')) value = eval(value)
        return frontmatter[key] = value
    })
    if(frontmatter) frontmatter = await specialFields(frontmatter)
    const content = lines.slice(i + 1).join("\n")
    return Promise.resolve({
        frontmatter,
        content,
    })
}

async function specialFields(fm) {
    if(fm['pin']) {
        const encoder = new TextEncoder();
        const data = encoder.encode(fm.pin);
        const buffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(buffer));
        fm.pin = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        
    }
    if(fm['date']) {
        const slashes = fm.date.split('/').length
        if(slashes) fm.date = new Date(fm.date)
    }
    return fm
}