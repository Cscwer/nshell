import { DiskConf } from "../Drive"; 

enum BlockStatus {
	FREE = 0, 
	USED = 1
}

export default class Fat implements DiskConf {
	BLOCK_SIZE: number; 
	TOTAL: number; 
	records: number[]

	constructor(conf: DiskConf) {
		this.records = new Array(
			Math.ceil(conf.TOTAL / conf.BLOCK_SIZE)
		).fill(BlockStatus.FREE); 

		this.BLOCK_SIZE = conf.BLOCK_SIZE; 
		this.TOTAL = conf.TOTAL; 
	}

	alloc(size: number): number[] {
        const how_many_blocks = Math.ceil(size / this.BLOCK_SIZE); 
        const blocks: number[] = []; 

        for (let i = 0; i < this.records.length; i ++) {
            const status = this.records[i]; 

            if (status === 0) {
                blocks.push(i); 
            }

            if (blocks.length === how_many_blocks) break; 
        }
        
        if (blocks.length === how_many_blocks) {
            blocks.forEach(i => this.records[i] = BlockStatus.USED); 
            return blocks;
        } else {
            return []; 
        }
	}
	
	realloc(pre_blocks: number[], total_size: number): number[] {
		const pre_size = this.BLOCK_SIZE * pre_blocks.length; 
		const increment = total_size - pre_size; 
		const inc_blocks = this.alloc(increment); 

		return pre_blocks.concat(inc_blocks); 
	}

    free(blocks: number[]) {
        blocks.forEach(i => this.records[i] = BlockStatus.FREE); 
	}

	static fromStr(fat_str: string, conf: DiskConf) {
		const fat = new Fat(conf); 

		fat_str.split('').forEach((e, i) => {
			const status = Number(e); 
			fat.records[i] = Number.isNaN(status) ? 0 : status; 
		});

		return fat; 
	}

	toJSON() {
		const str = this.records.join(''); 
		return str;
	}
}
