// import * as Path from "path"; 
import { FileSystem, Node, DiskConf, FileNode, DirNode, FileSystemInfo } from "../Node"; 
import { QiniuConfig } from "./QiniuDrive/type"; 
import pathResolve from "./path-resolve";
import QiniuDrive from "./QiniuDrive";
import * as Path from "path"; 

export type MountConf = DiskConf & QiniuConfig; 
export class Qiniu implements FileSystem<MountConf> {
    root: Node;
	fat: number[]; 

	drive: QiniuDrive; 
    get BLOCK_SIZE() { return this.drive.BLOCK_SIZE }
    get TOTAL() { return this.drive.TOTAL }

	async save(retry_times = 0): Promise<boolean> {
		if (retry_times > 3) return false; 

		const data = Buffer.from(JSON.stringify({
			root: this.root,
			fat: this.fat,
			BLOCK_SIZE: this.BLOCK_SIZE, 
			TOTAL: this.TOTAL
		})); 

		const success = await this.drive.write(0, data); 
		
		return success ? success : this.save(retry_times + 1); 
	}

	info(root = this.root, deep = 0) {
		if (root.isDir) {
			console.log("    ".repeat(deep), root.name || '/'); 
			root.files.forEach(i => this.info(i, deep + 1)); 
		} else {
			console.log("    ".repeat(deep), root.name + '.' + root.ext, '   # Size:', root.size); 
		}
	}

	ls(path: string = '/') {
		const target = this.find(path); 
		if (target) {
			this.info(target); 
		} else {
			console.log(`${ path } not found`); 
		}
	}
    
    find(path: string): Node | null {
        return pathResolve(this.root, path); 
    }

    alloc(size: number) {
        const how_many_blocks = Math.ceil(size / this.drive.BLOCK_SIZE); 
        const blocks: number[] = []; 

        for (let i = 0; i < this.fat.length; i ++) {
            const status = this.fat[i]; 

            if (status === 0) {
                blocks.push(i); 
            }

            if (blocks.length === how_many_blocks) break; 
        }
        
        if (blocks.length === how_many_blocks) {
            blocks.forEach(i => this.fat[i] = 1); 
            return blocks;
        } else {
            return []; 
        }
    }

    free(blocks: number[]) {
        blocks.forEach(i => this.fat[i] = 0); 
	}
	
	async format() {
		const how_many_blocks = Math.ceil(this.TOTAL / this.BLOCK_SIZE); 
		console.log('格式化');

		this.root = {
			isDir: true, 
			name: '', 
			files: []
		}
		this.fat = new Array(how_many_blocks).fill(0); 
		this.fat[0] = 1; 

		await this.touch('/hello.txt'); 
		await this.writeFile('/hello.txt', 'Hello, Nice To Meet You. '); 

		const success = await this.save(); 

		if (!success) {
			console.log('致命错误；格式化失败'); 
			process.exit(-1); 
		} else {
			console.log('格式化成功'); 
		}
	}

    async mount(conf: MountConf | null, times = 0): Promise<boolean> {
		if (conf) {
			this.drive = new QiniuDrive(); 
			await this.drive.mount(conf); 
		}

		if (times > 3) {
			console.log('请检查网络或系统设置'); 
			process.exit(-1); 
		}

		const theBlock = await this.drive.read(0); 

		if (theBlock) {
			const str = theBlock.toString(); 
			const pos = str.lastIndexOf('}');

			try {
				let temp: FileSystemInfo = JSON.parse(str.substring(0, pos + 1));
				
				this.fat = temp.fat; 
				this.root = temp.root; 

				return true; 
			} catch (err) {
				console.log('错误的零号区块, 需格式化'); 
				process.exit(-1); 
				// 需要格式化 
				// await this.format(); 
				// return this.mount(); 
				return false; 
			}
		} else {
			console.log('读取不到零号区块, 请检查网络或系统设置'); 
			process.exit(-1); 
			// await this.format(); 
			// return this.mount(); 
			return this.mount(null, times + 1); 
		}
	}

    async touch(path: string): Promise<FileNode | null> {
        const paths = path.split('/'); 
        
        if (paths.length <= 1) return null; 
            
        const fullname = paths.pop() as string; 
        const target = pathResolve(this.root, paths); 

        if (!target) return null; 
        if (!target.isDir) return null; 

        
        const temp = Path.parse(fullname); 
        const ext = temp.ext ? temp.ext.slice(1) : null; 
        const name = temp.name; 

        const newFile: FileNode = {
            name, ext, 
            isDir: false, 
            size: 0, 
            blocks: []
        }

		target.files.push(newFile); 
		
		await this.save(); 

        return newFile; 
    }

    async mkdir(path: string): Promise<DirNode | null> {
        const paths = path.split('/'); 
        
        if (paths.length <= 1) return null; 
            
        const name = paths.pop() as string; 
        const target = pathResolve(this.root, paths); 

        if (!target) return null; 
        if (!target.isDir) return null; 

        const newDir: DirNode = {
            name, 
            isDir: true, 
            files: []
        }

		target.files.push(newDir); 
		
		await this.save(); 

        return newDir; 
    } 

    async rm(path: string) {
        pathResolve(this.root, path); 
        return true; 
    }

	async writeFile(path: string, data: Buffer | string): Promise<boolean> {
		const node = pathResolve(this.root, path); 
		if (!node) return false; 
		if (node.isDir) return false; 

		if (typeof data === 'string') data = Buffer.from(data); 

		const blocks = this.alloc(data.length); 
		
		const success = await this.drive.writes(blocks, data); 

		if (success) {
			node.blocks = blocks; 
			node.size = data.length; 

			this.save(); 
			return true; 
		} else {
			this.free(blocks); 
			return false; 
		}
	}
	
    async readFile(path: string): Promise<Buffer | null> {
		const node = pathResolve(this.root, path); 
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
}
