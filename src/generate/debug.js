
import FastGlob from 'fast-glob';
const ROUTE_DATA = 'src/lib/data'
const MD_CONTENT = 'vaults/content/**/*.md'
export async function buildMenuTree() {
    const files = await FastGlob(MD_CONTENT);
    // const p = `${MD_CONTENT}/**/*.md`.toString()
    // import.meta.glob(MD_CONTENT, { eager: true, as: "raw" }).then((files) => console.log('vite',files));
    console.log('fglob',files)
    // let menu = [];
    // console.log(files)
    // Object.entries(CACHE).forEach(([path, item], i) => {
    //     const paths = path.split('/');
    //     const id = paths.pop();
    //     const label = ORIGINALS[id];
    //     const file = { id, label, link: `${item.route}`, published: item.published };

    //     buildTree(menu, paths, file, ORIGINALS, true);
    // });

    // await writeModule(menu, `menu`);
}

async function writeModule(data, filename = 'tbc') {
	const module = `export default ${JSON.stringify(data, null, 2)}`;
	await writeFile(
		`./${ROUTE_DATA}/${filename}.js`,
		module,
		(err) => err && console.log(err)
	);
	return Promise.resolve();
}

function buildTree(entry, paths, file, ORIGINALS, isRoot = false) {
	const node = isRoot ? entry : entry.children;
	if(!file.published) return
	if (!paths.length) return node.push(file);

	const targetDirectory = paths.shift();
	let next = node.find(({ id }) => id === targetDirectory);
	if (!next) {
		node.push({ id: targetDirectory, label: ORIGINALS[targetDirectory], children: [] });
		next = node.find(({ id }) => id === targetDirectory);
	}
	buildTree(next, paths, file, ORIGINALS);
}