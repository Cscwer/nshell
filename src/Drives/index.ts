import DrivePool from "./DrivePool"; 
import QiniuDrive from "../Qiniu/QiniuDrive"; 

const dp = new DrivePool(); 

const qndrive = new QiniuDrive(); 

qndrive.mount({
    AK: 'l0FIyYhaZ7QiYOBVopQnPjHP3Jp11vNsdPXp-hRT', 
    SK: 'bLtrNs-7qsck32uakAwCPT_N1mgbV6ihRObghXM5', 
    DOMAIN: 'p4etc0mft.bkt.clouddn.com', 
    BUCKET: 'des-store', 
    BLOCK_SIZE: 256 * 1024,  // 256 KB
    TOTAL: 50 * 1024 * 1024  //  50 MB
}); 

dp.add(qndrive); 

export default dp; 
