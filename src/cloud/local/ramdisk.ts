import { IStorage } from '../interfaces';

interface Blob {
    created: Date;
    owner: string;
    buffer: Buffer;
}

export class RamDisk implements IStorage {
    blobs = new Map<string, Buffer>();

    async writeBlob(name: string, buffer: Buffer): Promise<void> {
        this.blobs.set(name, buffer);
    }

    async readBlob(name: string): Promise<Buffer> {
        const buffer = this.blobs.get(name);
        if (buffer === undefined) {
            const message = `RamDisk: file ${name} not found.`;
            throw TypeError(message);
        } else {
            return buffer;
        }
    }

    async listBlobs(prefix = ''): Promise<string[]> {
        const results: string[] = [];
        for (const name of this.blobs.keys()) {
            // console.log(`checking ${name}`);
            if (name.startsWith(prefix)) {
                results.push(name);
            }
        }
        return results;
    }
}