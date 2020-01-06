import * as path from 'path';

import { IStorage, Volume } from '../interfaces';

class MountedVolumes implements IStorage {
    volumes = new Map<string, IStorage>();

    constructor(volumes: Volume[]) {
        for (const volume of volumes) {
            // TODO: also check whether one mount would be a prefix of another.
            if (this.volumes.has(volume.mount)) {
                const message = `MountedVolumes: mount ${volume.mount} already in use.`;
                throw TypeError(message);
            }
            this.volumes.set(volume.mount, volume.storage);
        }
    }

    async writeBlob(name: string, buffer: Buffer): Promise<void> {
        const { storage, relative } = this.translatePath(name);
        storage.writeBlob(relative, buffer);
    }

    async readBlob(name: string): Promise<Buffer> {
        const { storage, relative } = this.translatePath(name);
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

    async *listBlobsGenerator(prefix: string): AsyncIterableIterator<string> {
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
            if (normalized.startsWith(mount)) {
                const relative = path.relative(mount, normalized);
                return { storage, relative }
            }
        }

        const message = `Path ${normalized} not found`;
        throw TypeError(message);
    }
}
