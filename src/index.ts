import * as readline from "readline"; 
import { FileSystem } from "./FileSystem"; 
import QiniuDrive from "./QiniuDrive"; 

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'nshell> '
});


const qd = new QiniuDrive(); 

qd.mount({
	AK: 'l0FIyYhaZ7QiYOBVopQnPjHP3Jp11vNsdPXp-hRT', 
	SK: 'bLtrNs-7qsck32uakAwCPT_N1mgbV6ihRObghXM5', 
	DOMAIN: 'http://p4etc0mft.bkt.clouddn.com', 
	BUCKET: 'des-store', 
	BLOCK_SIZE: 256 * 1024,  // 256 KB
	TOTAL: 100 * 1024 * 1024  //  50 MB
}); 

(async () => {
	// 挂载 
	const qn = new FileSystem(qd); 
	await qn.mount(); 
	
	rl.prompt();
	

	rl.on('line', async (line: string) => {

		const [cmd, ...args] = line.split(' ').filter(e => !!e).map(e => e.trim()); 

		if (qn[cmd]) {
			try {
				const result = await qn[cmd](...args); 
				console.log(result); 
			} catch (err) {
				console.log(`Error When Exec '${ line }'`); 
				console.error(err); 
			}
		} else {
			console.log(`command '${ cmd }' not found.`); 
		}
		
		rl.prompt();
	}).on('close', () => {
		console.log('再见!');
		process.exit(0);
	});

	// const d = await qn.readFile('/hello.txt')
	// console.log(d && d.toString()); 

	// // 读取本地图片 
	// const f = `C:\\Users\\eczn\\Desktop\\wallpic\\2ae0c128484ae3f31d206d514e53b2b0.png`; 
	// const data = await fs.readFileSync(f); 

	// // 创建新文件
	// await qn.touch('/test.jpg'); 

	// // 写入数据 
	// const res = await qn.writeFile('/test.jpg', data); 

	// // 读取数据 
	// const buf = await qn.readFile('/test.jpg');

	// // 吧读取的数据回写到磁盘里
	// fs.writeFileSync('./test.jpg', buf); 
})(); 
