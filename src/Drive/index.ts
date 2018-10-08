export type DiskConf = {
	/**
	 * 区块大小
	 */
	BLOCK_SIZE: number; 

	/**
	 * 存储总大小 
	 */
	TOTAL: number; 	
}

export type Drive = {
	/**
	 * 单个块写入
	 * @param block_no 区块号
	 * @param buf 数据
	 */
	write: (block_no: number, buf: Buffer) => Promise<boolean>; 

	/**
	 * 批量写入 
	 * @param blocks 区块号数组
	 * @param data 数据, Buffer
	 */
	writes: (blocks: number[], buf: Buffer) => Promise<boolean>; 

	/**
	 * 单个块读取
	 * @param block_no 区块号
	 */
	read: (block_no: number) => Promise<Buffer | null>; 

	/**
	 * 多个块读取
	 * @param blocks 区块号
	 */
	reads: (blocks: number[]) => Promise<Buffer | null>; 

	/**
	 * 驱动挂载
	 */
	mount: (conf: DiskConf) => Promise<boolean>;
} & DiskConf

