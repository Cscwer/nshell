import { IncomingHttpHeaders } from "http"; 

export type RespBody = {
    hash: string, 
    key: string
}

export type RespInfo<T> = {
    [key: string]: any; 
    status: number, 
    statusCode: number, 
    headers: IncomingHttpHeaders, 
    size: number, 
    aborted: boolean, 
    rt: number, 
    keepAliveSocket: boolean, 
    data: T, 
    requestUrls: string[], 
    timing: null, 
    remoteAddress: string, 
    remotePort: number
}

export interface QiniuConfig {
    AK: string; 
    SK: string; 
    DOMAIN: string; 
    BUCKET: string; 
}

export type DefaultRespInfo = RespInfo<RespBody>
