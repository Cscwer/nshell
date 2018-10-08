import { Node, FileNode, DirNode } from "./node-define"; 

function nameEqual(n: Node | null, fullname: string) {
	if (!n) return false; 

	if (n.isDir) {
		return n.name === fullname; 
	} else {
		return (n.name + '.' + n.ext) === fullname; 
	}
}

function pathResolve(root: Node, paths: string[]): Node | null {
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

export function resolve(root: Node, path: string | string[]) {
    if (typeof path === 'string') {
		if (path === '/') path = ''; 

        return pathResolve(root, path.split('/')); 
    } else {
        return pathResolve(root, path); 
    }
}

export function createFileNode(name: string, ext: string | null = null): FileNode {
	const now = Date.now(); 

	return {
		create_at: now, update_at: now, 
		name,  
		ext,
		isDir: false, 
		size: 0, 
		blocks: []
	}
}

export function createDirNode(name: string): DirNode {
	const now = Date.now(); 
	return {
		create_at: now, update_at: now, 
		name, 
		isDir: true, 
		files: []
	}
}

