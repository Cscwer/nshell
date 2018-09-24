import { Node } from "../Node"; 

export function pathResolve(root: Node | null, paths: string[]): Node | null {
    console.log(root, paths); 

    const [first, ...rest] = paths; 
    console.log(first, rest); 
    console.log('_')

    
    if (!root) {
        return null;
    } else {
        
    }
}

export default function(root: Node, path: string | string[]) {
    if (typeof path === 'string') {
        return pathResolve(root, path.split('/')); 
    } else {
        return pathResolve(root, path); 
    }
}
