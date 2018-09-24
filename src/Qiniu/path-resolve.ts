import { Node } from "../Node"; 

function nameEqual(n: Node | null, fullname: string) {
	if (!n) return false; 

	if (n.isDir) {
		return n.name === fullname; 
	} else {
		return (n.name + '.' + n.ext) === fullname; 
	}
}

export function pathResolve(root: Node, paths: string[]): Node | null {
    const [first, ...rest] = paths; 
	
	if (rest.length) {
		if (root.isDir) {
			const target = root.files.find(n => nameEqual(n, rest[0])); 

			return target ? pathResolve(target, rest) : null; 
		} else {
			return null; 
		}
	} else {
		return nameEqual(root, first) ? root : null; 
	}
}

export default function resolve(root: Node, path: string | string[]) {
    if (typeof path === 'string') {
        return pathResolve(root, path.split('/')); 
    } else {
        return pathResolve(root, path); 
    }
}
