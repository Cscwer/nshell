// import { Node } from "../Node"; 
// import conf from "./config"; 
// const store_type = conf.STORE_TYPE; 

import * as qiniu from "qiniu"; 
// import * as fs from "fs"; 
import * as rp from "request-promise-native"; 
import conf from "./config"; 
import { RespBody, RespInfo } from "./type"; 

const AK = 'l0FIyYhaZ7QiYOBVopQnPjHP3Jp11vNsdPXp-hRT'; 
const SK = 'bLtrNs-7qsck32uakAwCPT_N1mgbV6ihRObghXM5'; 

const DOMAIN = `http://p4etc0mft.bkt.clouddn.com`; 
const BUCKET = 'des-store';

// zone: qiniu.zone.Zone_z2
const qnconfig = new qiniu.conf.Config({ zone: qiniu.zone.Zone_z2 });

// Qiniu Mac
const mac = new qiniu.auth.digest.Mac(AK, SK);

// 七牛表单
const formUploader = new qiniu.form_up.FormUploader(qnconfig);
const putExtra = new qiniu.form_up.PutExtra();

const auth = {
    /**
     * 获取 key 
     */
    _getKey: (block_no: number) => `nshell-blocks/${ block_no }`, 

    /**
     * 获取上传用的 token
     * @param block_no 区块号 
     */
    upload(block_no: number) {
        const key = this._getKey(block_no); 
    
        const putPolicy = new qiniu.rs.PutPolicy({
            scope: BUCKET + ":" + key
        });
    
        const token = putPolicy.uploadToken(mac);
    
        return {
            token, key
        }
    }, 

    /**
     * 获取下载地址
     * @param block_no 区块号
     */
    download(block_no: number) {
        const key = this._getKey(block_no); 

        const bucketManager = new qiniu.rs.BucketManager(mac, conf);
        
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时过期

        return bucketManager.privateDownloadUrl(DOMAIN, key, deadline);
    }
}

/**
 * 单个块写入
 * @param block_no 区块号
 * @param buf 数据
 */
export function write(block_no: number, data: Buffer): Promise<boolean> {
    const { token, key } = auth.upload(block_no); 
    const fill = Buffer.alloc(conf.BLOCK_SIZE - data.length);
    const buf = Buffer.concat([data, fill]);     

    return new Promise((resolve, reject) => {
        formUploader.put(token, key, buf, putExtra, (respErr, respBody: RespBody, respInfo: RespInfo<RespBody>) => {
            if (respErr) resolve(false); 

            if (respInfo.statusCode === 200) {
                resolve(true); 
            } else {
                resolve(false); 
            }
        }); 
    })
}

/**
 * 单个区块读入 
 * @param block_no 区块号
 */
export function read(block_no: number): Promise<Buffer | null> {
    const url = auth.download(block_no); 

    return rp.get(url, {
        encoding: null, 
        timeout: 5000
    }).catch(err => {
        return null; 
    });
}
