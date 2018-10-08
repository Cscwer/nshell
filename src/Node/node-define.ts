/**
 * 节点基本属性
 */
export interface BaseInfo {
    /**
     * 文件名 
     */
	name: string; 
	
	/**
	 * 创建时间戳 
	 */
	create_at: number; 

	/**
	 * 修改时间戳 
	 */
	update_at: number; 
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
