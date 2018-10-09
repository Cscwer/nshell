import {
	Node, DirNode, FileNode, resolve,
	createMinimalNode, createFileNode, createDirNode
} from "../Node"; 
import { Drive, DiskConf } from "../Drive"; 
import * as Path from "path"; 
import Fat from "./Fat"; 
import FSError from "./FSError"; 

export interface FileSystemInfo {
	root: Node; 
	fat: string;
} 

export class FileSystem implements DiskConf {
	root: Node; 
	fat: Fat; 
	drive: Drive; 

	get BLOCK_SIZE() { return this.drive.BLOCK_SIZE }
	get TOTAL() { return this.drive.TOTAL }

	constructor(drive: Drive) {
		this.drive = drive; 
	}

	async save(times = 0): Promise<boolean> {
		if (times > 5) {
			console.log('FSInfo Save Faild.'); 
			return false; 
		}

		const ok = await this.drive.write(0, Buffer.from(JSON.stringify({
			root: this.root, 
			fat: this.fat, 
			BLOCK_SIZE: this.BLOCK_SIZE, 
			TOTAL: this.TOTAL
		}))); 

		if (ok) {
			return true; 
		} else {
			return this.save(times + 1); 
		}
	}

    async mount(times = 0): Promise<boolean> {
		if (times > 5) {
			console.log('请检查网络或系统设置, 或执行格式化操作'); 
			process.exit(-1); 
		}

		const theBlock = await this.drive.read(0); 

		const str = theBlock.toString(); 
		const pos = str.lastIndexOf('}');

		try {
			let temp: FileSystemInfo = JSON.parse(str.substring(0, pos + 1));
			
			this.fat = Fat.fromStr(temp.fat, { BLOCK_SIZE: this.BLOCK_SIZE, TOTAL: this.TOTAL }); 
			this.root = temp.root; 

			return true; 
		} catch (err) {
			throw FSError.ZERO_BLOCK_BAD_FORMAT; 
		}
		// return this.mount(times + 1); 
	}

	async format() {
		const fat = Fat.fromStr('', { BLOCK_SIZE: this.BLOCK_SIZE, TOTAL: this.TOTAL }); 
		fat.alloc(this.BLOCK_SIZE); 
		const root = createMinimalNode(); 

		this.fat = fat; 
		this.root = root; 

		return this.save(); 
	}

	async touch(path: string): Promise<FileNode | null> {
        const paths = path.split('/'); 
        
        if (paths.length <= 1) return null; 
            
        const fullname = paths.pop() as string; 
        const target = resolve(this.root, paths); 

        if (!target) return null; 
        if (!target.isDir) return null; 

        
        const temp = Path.parse(fullname); 
        const ext = temp.ext ? temp.ext.slice(1) : null; 
		const name = temp.name; 
		
        const newFile: FileNode = createFileNode(name, ext); 

		target.files.push(newFile); 
		
		await this.save(); 

        return newFile; 
	}
	
    async mkdir(path: string): Promise<DirNode | null> {
        const paths = path.split('/'); 
        
        if (paths.length <= 1) return null; 
            
        const name = paths.pop() as string; 
        const target = resolve(this.root, paths); 

        if (!target) return null; 
        if (!target.isDir) return null; 

        const newDir: DirNode = createDirNode(name); 

		target.files.push(newDir); 
		
		await this.save(); 

        return newDir; 
    }

	async writeFile(path: string, data: Buffer | string): Promise<boolean> {
		let node = resolve(this.root, path); 

		// 文件夹
		if (node && node.isDir) return false; 

		// 创建文件
		if (!node) {
			const newFile = await this.touch(path); 
			node = newFile; 
		}
		
		// path 无效
		if (!node) return false; 

		if (typeof data === 'string') data = Buffer.from(data); 

		const blocks = this.fat.realloc(node.blocks, data.length); 
		
		const success = await this.drive.writes(blocks, data); 

		if (success) {
			node.blocks = blocks; 
			node.size = data.length; 
			node.update_at = Date.now(); 
			this.save(); 
			return true; 
		} else {
			this.fat.free(blocks); 
			return false; 
		}
	}
	
    async readFile(path: string): Promise<Buffer | null> {
		const node = resolve(this.root, path); 
		if (!node) return null; 
		if (node.isDir) return null; 
		
		const data = await this.drive.reads(node.blocks); 

		if (data) {
			const d = this.BLOCK_SIZE - (node.size % this.BLOCK_SIZE); 
			return data.slice(0, data.length - d); 
		} else {
			return null; 
		}
	}

	ls(path: string = '/') {
		return resolve(this.root, path); 
	}

	info(root = this.root, deep = 0) {
		if (root.isDir) {
			console.log("    ".repeat(deep), root.name || '/'); 
			root.files.forEach(i => this.info(i, deep + 1)); 
		} else {
			console.log("    ".repeat(deep), root.name + '.' + root.ext, '   # Size:', root.size, '  @ Blocks:', root.blocks); 
		}
	}
}

