import { DiskConf } from "../../Node"; 

const config: DiskConf = {
    STORE_TYPE: 'qiniu', 
    BLOCK_SIZE: 256 * 1024,  // 256 KB
    TOTAL: 50 * 1024 * 1024  // 50 MB
}

export default config; 
