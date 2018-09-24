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
     * 单个区块读入 
     * @param block_no 区块号
     */
    read: (block_no: number) => Promise<Buffer | null>; 

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
     * 文件后缀 
     */
    ext: string | null;

    /**
     * 文件存储类型
     */
    store_type: string
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
    blocks: string[]; 
}

/**
 * 节点
 */
export type Node = DirNode | FileNode; 

