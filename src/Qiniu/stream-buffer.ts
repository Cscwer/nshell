import { Readable, Stream } from "stream"; 

export function buf2stream(buf: Buffer): Readable {
    const stream = new Readable(); 
    stream.push(buf); 
    stream.push(null); 

    return stream; 
}

export function stream2buf(stream: Stream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        let buffers: Buffer[] = [];

        stream.on('error', reject);;
        stream.on('data', data => buffers.push(data)); 
        stream.on('end', () => resolve(Buffer.concat(buffers))); 
    });
}
