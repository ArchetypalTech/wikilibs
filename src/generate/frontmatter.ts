interface Frontmatter {
    pin?: string;
    description?: string;
    published?: string;
    tags?: string[];
    date?: string | Date;
    signup?: string[];
}
type Front = keyof Frontmatter;
export default async function (text: string, delimiter = "---") {
    const lines = text.split("\n");
    let frontmatter: Frontmatter = {};
    let startIndex = null;
    let endIndex = null;
    let i = 0;
    let startIsTruthy = false;
    let endIsTruthy = false;
    // extract frontmatter
    while (i < lines.length) {
        const line = lines[i].trim();
        const startingLine = lines[0].trim();
        startIsTruthy = typeof startIndex === "number";
        endIsTruthy = typeof endIndex === "number";

        if (!startIsTruthy && startingLine.includes(delimiter)) startIndex = 0;
        if (startIndex !== i && !endIsTruthy && line.includes(delimiter))
            endIndex = i;
        if (startIsTruthy && endIsTruthy) {
            break;
        }
        i++;
    }
    console.log(startIsTruthy, endIsTruthy);
    if (!startIsTruthy || !endIsTruthy)
        return Promise.resolve({ content: text });
    // format frontmatter
    let data = [];
    // @ts-ignore
    data = lines.slice(startIndex + 1, endIndex);
    console.log(data);
    data.forEach((keyval: string) => {
        const kv = keyval.split(":");
        console.log(kv);
        if (kv.length !== 2) return;
        const key = kv[0] as Front;
        let value: string = kv[1].trim();
        // if (value.includes("[") && value.includes("]")) value = eval(value);
        if (value.startsWith("[") && value.endsWith("]")) {
            try {
                value = JSON.parse(value);
            } catch (e) {
                console.error("Failed to parse value as JSON:", value);
            }
        }
        console.log(key);
        if (key === "tags" && Array.isArray(value)) {
            frontmatter[key] = value;
        } else {
            frontmatter[key] = value as any;
        }
    });
    console.log(frontmatter);
    frontmatter = await specialFields(frontmatter);
    console.log(frontmatter);
    const content = lines.slice(i + 1).join("\n");
    return Promise.resolve({
        frontmatter,
        content,
    });
}

async function specialFields(fm: Frontmatter) {
    if (fm["pin"]) {
        const encoder = new TextEncoder();
        const data = encoder.encode(fm.pin);
        const buffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(buffer));
        fm.pin = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    if (fm["date"]) {
        const slashes =
            typeof fm.date === "string" && fm.date.split("/").length;
        if (slashes) fm.date = new Date(fm.date);
    }
    return fm;
}
