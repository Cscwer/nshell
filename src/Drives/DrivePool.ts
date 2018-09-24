import { Drive } from "../Node"

export type BaseAnyConfig = {
    [key: string]: any
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

    find(type: string) {
        return this.pools.find(d => d.STORE_TYPE === type); 
    }
}
