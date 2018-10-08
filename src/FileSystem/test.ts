import Fat from "./Fat"; 

const fat = new Fat({
	BLOCK_SIZE: 512, 
	TOTAL: 3248
})

console.log(fat); 
fat.alloc(20); 
console.log(fat); 
fat.alloc(1); 
console.log(fat); 
console.log(JSON.stringify(fat)); 

console.log(Fat.fromStr('', { BLOCK_SIZE: 512, TOTAL: 3248 })); 
