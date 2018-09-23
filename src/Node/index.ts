export type StoreType = 'fs' | 'qiniu'; 

export type Conf = {
    STORE_TYPE: StoreType, 
    BLOCK_SIZE: number
}

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
    store_type: StoreType
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
     * 块索引 
     */
    blocks: string[]; 
}

/**
 * 节点
 */
export type Node = DirNode | FileNode; 

