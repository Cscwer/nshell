import { Node, FileNode, DirNode } from "./node-define"; 

function nameEqual(n: Node | null, fullname: string) {
	if (!n) return false; 

	if (n.isDir) {
		return n.name === fullname; 
	} else {
		return (n.name + '.' + n.ext) === fullname; 
	}
}

function pathResolve(root: Node | null, paths: string[]): Node | null {
	if (!root) return null; 

	const [first, ...rest] = paths; 

	if (first) {
		if (root.isDir) {
			const target = root.files.find(n => nameEqual(n, first)) || null; 

			return pathResolve(target, rest); 
		} else {
			return rest.length ? null : (
				nameEqual(root, first) ? root : null
			);
		}
	} else {
		return root; 
	}
}

export function resolve(root: Node, path: string | string[]) {
	if (!path) return null; 

    if (typeof path === 'string') {
		const paths = path.split('/').filter(e => e); 
        return pathResolve(root, paths); 
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

