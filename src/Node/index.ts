/**
 * Type Util 
 */
export type RemoveKey<Base, Condition> = Pick<Base, {
    [key in keyof Base]: 
        key extends Condition ? never : key
}[keyof Base]>

/**
 * Type 
 */
export interface DiskConf {
    STORE_TYPE?: string, 
    BLOCK_SIZE: number, 
    TOTAL: number
}

/**
 * 驱动接口 
 */
export type Drive<BaseConf> = {
    /**
     * 单个块写入
     * @param block_no 区块号
     * @param buf 数据
     */
	write: (block_no: number, data: Buffer) => Promise<boolean>; 
	
	/**
	 * 批量写入 
	 * @param blocks 区块号数组
	 * @param data 数据, Buffer
	 */
	writes: (blocks: number[], data: Buffer) => Promise<boolean>; 

    /**
     * 单个区块读入 
     * @param block_no 区块号
     */
	read: (block_no: number) => Promise<Buffer | null>; 
	
	/**
	 * 批量读出 
	 * @param blocks 区块号数组
	 */
	reads: (blocks: number[]) => Promise<Buffer | null>; 

    /**
     * 挂载, 挂载的时候无需指定 STORE_TYPE
     */
    mount: (conf: BaseConf & DiskConf) => Promise<boolean>; 

} & (BaseConf & DiskConf); 

/**
 * 节点基本属性
 */
export interface BaseInfo {
    /**
     * 文件名 
     */
    name: string; 

    /**
     * 文件存储类型
     */
    store_type?: string
}

/**
 * 文件夹节点
 */
export interface DirNode extends BaseInfo {
    /**
     * 是文件夹
     */
    isDir: true;

    /**
     * 子文件
     */
    files: Node[];
}

/**
 * 文件节点
 */
export interface FileNode extends BaseInfo {
    /**
     * 不是文件夹
     */
    isDir: false; 

    /**
     * 文件大小 
     */
    size: number, 

    /**
     * 块索引 
     */
    blocks: number[]; 

    /**
     * 文件后缀 
     */
    ext: string | null;
}

/**
 * 节点
 */
export type Node = DirNode | FileNode; 

/**
 * FileSystem
 */
export type FileSystemInfo = {
    root: Node, 
    fat: number[]
} & DiskConf;

/**
 * 文件系统
 */
export type FileSystem<BaseConf> = {
    find: (path: string) => Node | null; 
    alloc: (size: number) => number[]; 
    free: (blocks: number[]) => void; 

	mount: (conf?: (BaseConf & DiskConf) | null) => Promise<boolean>; 
	format: () => Promise<any>; 

    touch: (path: string) => Promise<FileNode | null>; 
    mkdir: (path: string) => Promise<DirNode | null>; 
    rm: (path: string) => Promise<boolean>; 

    writeFile: (path: string, data: Buffer) => Promise<boolean>; 
	readFile: (path: string) => Promise<Buffer | null>;  
	
	save: (retry_times: number) => Promise<boolean>; 

    drive: Drive<BaseConf>; 
} & FileSystemInfo;

