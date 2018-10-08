import QiniuFS from "./index"; 
import QiniuDrive from "../QiniuDrive"; 

const qd = new QiniuDrive(); 
qd.mount({
	AK: 'l0FIyYhaZ7QiYOBVopQnPjHP3Jp11vNsdPXp-hRT', 
	SK: 'bLtrNs-7qsck32uakAwCPT_N1mgbV6ihRObghXM5', 
	DOMAIN: 'http://p4etc0mft.bkt.clouddn.com', 
	BUCKET: 'des-store', 
	BLOCK_SIZE: 256 * 1024,  // 256 KB
	TOTAL: 100 * 1024 * 1024  //  50 MB
}); 

const qfs = new QiniuFS(qd); 

(async () => {
	await qfs.mount(); 
	qfs.info(); 
	
	const d = await qfs.readFile('/test.txt')
	console.log( d && d.toString() ); 
})()

