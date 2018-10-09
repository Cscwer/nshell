export default {
	get ZERO_BLOCK_NOT_FOUND() {
		return {
			code: 500, 
			detail: new Error('找不到零号区块')
		}
	},

	get ZERO_BLOCK_BAD_FORMAT() {
		return {
			code: 501, 
			detail: new Error('零号区块格式错误')
		}
	}
}
