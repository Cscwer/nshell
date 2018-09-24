// import * as Path from "path"; 
import { FileSystem, Node, DiskConf, FileNode, DirNode } from "../Node"; 
import { QiniuConfig } from "./QiniuDrive/type"; 
import pathResolve from "./path-resolve";
import QiniuDrive from "./QiniuDrive";
import * as Path from "path"; 

const qnd = new QiniuDrive(); 
qnd.mount({
    AK: 'l0FIyYhaZ7QiYOBVopQnPjHP3Jp11vNsdPXp-hRT', 
    SK: 'bLtrNs-7qsck32uakAwCPT_N1mgbV6ihRObghXM5', 
    DOMAIN: 'p4etc0mft.bkt.clouddn.com', 
    BUCKET: 'des-store', 
    BLOCK_SIZE: 256 * 1024,  // 256 KB
    TOTAL: 50 * 1024 * 1024  //  50 MB
}); 

export type MountConf = DiskConf & QiniuConfig; 
export class Qiniu implements FileSystem<MountConf> {
    root: Node = {
        isDir: true, 
        name: '', 
        files: [
            {
                isDir: false, 
                name: '123', 
                ext: 'txt', 
                size: 0, 
                blocks: []
            }
        ]
    };  
    fat: number[]; 
    get BLOCK_SIZE() { return this.drive.BLOCK_SIZE }
    get TOTAL() { return this.drive.TOTAL }

    drive = qnd; 

    
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

    async mount(conf: MountConf) {
        return true; 
    }

    async touch(path: string): Promise<FileNode | null> {
        const paths = path.split('/'); 
        
        if (paths.length <= 1) return null; 
            
        const fullname = paths.pop() as string; 
        const target = pathResolve(this.root, paths); 

        if (!target) return null; 
        if (!target.isDir) return null; 

        
        const temp = Path.parse(fullname); 
        const ext = temp.ext; 
        const name = temp.name; 

        const newFile: FileNode = {
            name, ext, 
            isDir: false, 
            size: 0, 
            blocks: []
        }

        target.files.push(newFile); 

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

        return newDir; 
    } 

    async rm(path: string) {
        pathResolve(this.root, path); 
        return true; 
    }

    writeFile: (path: string, data: Buffer) => Promise<boolean>; 
    readFile: (path: string) => Promise<Buffer | null>;  
}


const qn = new Qiniu(); 


const d = qn.find('/123.txt'); 
console.log('res'); 
console.log(d); 
