import * as path from 'path';

import { BlobCreateHandler, IStorage, Volume } from '../interfaces';

export class MountedVolumes implements IStorage {
    private volumes = new Map<string, IStorage>();
    private blobCreateHandlers: BlobCreateHandler[] = [];

    constructor(volumes: Volume[]) {
        for (const volume of volumes) {
            // TODO: also check whether one mount would be a prefix of another.
            if (this.volumes.has(volume.mount)) {
                const message = `MountedVolumes: mount ${volume.mount} already in use.`;
                throw new TypeError(message);
            }
            this.volumes.set(volume.mount, volume.storage);
        }
    }

    async appendBlob(name: string, buffer: Buffer): Promise<void> {
        const { storage, relative } = this.translatePath(name);
        storage.appendBlob(relative, buffer);
    }

    async writeBlob(name: string, buffer: Buffer): Promise<void> {
        const { storage, relative } = this.translatePath(name);
        storage.writeBlob(relative, buffer);
        for (const handler of this.blobCreateHandlers) {
            await handler(name);
        }
    }

    async readBlob(name: string): Promise<Buffer> {
        const { storage, relative } = this.translatePath(name);
        // console.log(`read blob - name: "${name}", relative: "${relative}"`);
        return storage.readBlob(relative);
    }

    async listBlobs(prefix?: string): Promise<string[]> {
        // TODO: check implementation
        // This one is trickier as one has to iterate over all of the
        // volumes with matching mounts.

        const blobs: string[] = [];
        for await (const blob of this.listBlobsGenerator(prefix || '')) {
            blobs.push(blob);
        }
        return blobs;
    }

    async onBlobCreate(handler: BlobCreateHandler): Promise<void> {
        this.blobCreateHandlers.push(handler);
    }

    private async *listBlobsGenerator(prefix: string): AsyncIterableIterator<string> {
        const normalized = path.posix.normalize(prefix);
        for (const [mount, storage] of this.volumes) {
            if (normalized.startsWith(mount)) {
                const relative = path.relative(mount, normalized);
                const blobs = await storage.listBlobs(relative);
                for (const blob of blobs) {
                    yield blob;
                }
            }
        }
    }

    private translatePath(p: string): { storage: IStorage, relative: string} {
        const normalized = path.posix.normalize(p);
        for (const [mount, storage] of this.volumes) {
            // console.log(`normalized="${normalized}" mount="${mount}"`);
            if (normalized.startsWith(mount)) {
                const relative = path.relative(mount, normalized);
                return { storage, relative }
            }
        }

        const message = `Path ${normalized} not found`;
        throw new TypeError(message);
    }
}

// // Save for unit test
// function go() {
//     const volumeA: Volume = {
//         // TODO: do mounts need to be at the root (ie start with /)?
//         mount: '/a',
//         storage: new RamDisk()
//     };
//     const volumeBC: Volume = {
//         mount: '/b/c',
//         storage: new RamDisk()
//     };
//     const volumes = new MountedVolumes([volumeA, volumeBC]);

//     const cases = [
//         '/a/one',
//         '/a',
//         '/b/c/two/three',
//         // '/b/one'
//     ];

//     for (const filepath of cases) {
//         const x = volumes.translatePath(filepath);
//         console.log(`${filepath}: ${x.relative}`);
//     }
// }
