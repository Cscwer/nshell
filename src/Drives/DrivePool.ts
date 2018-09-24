import { Drive } from "../Node";
import QiniuDrive from "../Qiniu/QiniuDrive"; 

export type BaseAnyConfig = any & {
    "qiniu": QiniuDrive
}

export default class DrivePool {
    pools: Drive<BaseAnyConfig>[]; 

    add(drive: Drive<BaseAnyConfig>) {
        this.pools.push(drive); 

        return this; 
    }

    remove(drive: Drive<any>) {
        this.pools = this.pools.filter(d => d !== drive); 

        return this; 
    }

    find(type: string): Drive<BaseAnyConfig> | null {
        return this.pools.find(e => e.STORE_TYPE === type) || null; 
    }
}
