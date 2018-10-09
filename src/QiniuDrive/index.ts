import { Drive, DiskConf, DriveError } from "../Drive"; 
import * as qiniu from "qiniu"; 
import * as rp from "request-promise-native"; 
import * as Url from "url"; 
import { RespBody, RespInfo, QiniuConfig } from "./type"; 


if (process.env.HTTP_PROXY) {
    const tunnel = require('tunnel-agent'); 
    const p = Url.parse(process.env.HTTP_PROXY); 

    // @ts-ignore 七牛代理配置
    qiniu.conf.RPC_HTTP_AGENT = tunnel.httpOverHttp({
        proxy: {
            host: p.host,
            port: p.port || 80
        }
    });

    // Request 代理配置
    rp.defaults({ proxy: process.env.HTTP_PROXY }); 
}

// 七牛表单
const uploadConf = new qiniu.conf.Config({ zone: qiniu.zone.Zone_z2 });
const formUploader = new qiniu.form_up.FormUploader(uploadConf);
const putExtra = new qiniu.form_up.PutExtra();


export type MountConf = DiskConf & QiniuConfig; 

export default class QiniuDrive implements Drive {
	// Qiniu Conf 
    AK: string; 
    SK: string; 
    DOMAIN: string; 
	BUCKET: string; 
	
	// Disk Conf 
    BLOCK_SIZE: number; 
    TOTAL: number; 

    /**
     * get key 
     * @param block_no 
     */
    getKey(block_no: number) {
        return `nshell-blocks/${ block_no }`; 
    } 

    /**
     * 获取上传用的 token
     * @param block_no 区块号 
     */
    uploadAuth(block_no: number) {
        const mac = new qiniu.auth.digest.Mac(this.AK, this.SK);
        const key = this.getKey(block_no); 
    
        const putPolicy = new qiniu.rs.PutPolicy({
            scope: this.BUCKET + ":" + key
        });
    
        const token = putPolicy.uploadToken(mac);
    
        return {
            token, key
        }
    }

    /**
     * 获取下载地址
     * @param block_no 区块号
     */
    downloadAuth(block_no: number) {
        const mac = new qiniu.auth.digest.Mac(this.AK, this.SK);
        const key = this.getKey(block_no); 

        const bucketManager = new qiniu.rs.BucketManager(mac, {
			AK: this.AK, SK: this.SK,
			DOMAIN: this.DOMAIN, BUCKET: this.BUCKET
		});
        
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时过期

        return bucketManager.privateDownloadUrl(this.DOMAIN, key, deadline);
    }

    /**
     * 挂载 
     * @param conf 
     */
    mount(conf: MountConf) {
        this.AK = conf.AK; 
        this.SK = conf.SK; 
        this.DOMAIN = conf.DOMAIN; 
        this.BUCKET = conf.BUCKET;

        this.TOTAL = conf.TOTAL; 
        this.BLOCK_SIZE = conf.BLOCK_SIZE; 

        return Promise.resolve(true);
    }

    write(block_no: number, data: Buffer): Promise<boolean> {
        console.log('Write', block_no, data); 

        const { token, key } = this.uploadAuth(block_no); 
        const fill = Buffer.alloc(this.BLOCK_SIZE - data.length);
        const buf = Buffer.concat([data, fill]);     

        return new Promise((resolve, reject) => {
            formUploader.put(token, key, buf, putExtra, (respErr, respBody: RespBody, respInfo: RespInfo<RespBody>) => {
                if (respErr) {
					throw DriveError.NET_ERROR(respErr); 
                }

                if (respInfo.statusCode === 200) {
                    resolve(true); 
                } else {
                    resolve(false); 
                }
            }); 
        })
	}
	
	writes(blocks: number[], data: Buffer) {
		const tasks = blocks.map((block_no, i) => {
			const start = i * this.BLOCK_SIZE; 
			const end = (i + 1) * this.BLOCK_SIZE; 
			const part = data.slice(start, end); 

			return this.write(block_no, part); 
		}); 

		return Promise.all(tasks).then(results => {
			return results.every(r => r); 
		}); 
	}

    read(block_no: number): Promise<Buffer> {
        console.log('Read', block_no); 

		const url = this.downloadAuth(block_no); 
    
        return rp.get(url, {
            encoding: null, 
            timeout: 5000
        }).catch(err => {
			throw DriveError.NET_ERROR(err);
        });
	}
	
	reads(blocks: number[]) {
		const tasks = blocks.map(block_no => {
			return this.read(block_no);
		}); 

		return Promise.all(tasks).then(results => {
			// @ts-ignore
			return Buffer.concat(results, blocks.length * this.BLOCK_SIZE);
		}); 
	}
}
