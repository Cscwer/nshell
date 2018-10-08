import { Node } from "./node-define"; 

export function createMinimalNode(): Node {
	const now = Date.now(); 
	return {
		name: '', 
		isDir: true, 
		create_at: now, 
		update_at: now, 
		files: [
			{
				name: 'hello', 
				ext: 'txt', 
				isDir: false, 
				size: 0, 
				blocks: [], 
				create_at: now, 
				update_at: now, 
			}
		]
	}
}
