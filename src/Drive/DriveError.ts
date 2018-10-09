export const DriveError = {
	get READ_TIMEOUT() {
		return {
			code: 100, 
			detail: new Error('读超时')
		}
	},

	get WRITE_TIMEOUT() {
		return {
			code: 101, 
			detail: new Error('写超时')
		}
	},

	get BLOCK_NOT_FOUND() {
		return {
			code: 102, 
			detail: new Error('所要读写的 BLOCK 不存在')
		}
	}, 

	NET_ERROR(detail: Error) {
		return {
			code: 103, 
			detail
		}
	}
}
