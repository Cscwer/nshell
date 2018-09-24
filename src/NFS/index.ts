import * as Path from "path"; 
import { Node } from "../Node"; 



// /**
//  * 创建空文件
//  * @param name 文件名，形如 [name].[ext] 
//  * @param ext 若指定此项，则不把 name 中的 ext 作为 ext，而是优先用此项
//  */
// export async function touch(name: string, ext: string | null = null): Promise<Node> {
//     if (!ext) {
//         ext = Path.parse(name).ext || null; 
//     }

//     return {
//         isDir: false, 
//         store_type,
//         name, 
//         ext, 
//         size: 0, 
//         blocks: [], 
//     }
// }
