import * as fs from 'fs';
import * as path from 'path';

import { IStorage } from '../interfaces';

export class LocalDisk implements IStorage {
    private root: string;

    constructor(root: string) {
        this.root = path.normalize(root);
        // console.log(`root = "${this.root}"`);
    }

    async writeBlob(name: string, buffer: Buffer): Promise<void> {
        // this.blobs.set(name, buffer);
    }

    async readBlob(name: string): Promise<Buffer> {
        // const buffer = this.blobs.get(name);
        // if (buffer === undefined) {
        //     const message = `RamDisk: file ${name} not found.`;
        //     throw TypeError(message);
        // } else {
        //     return buffer;
        // }
        return null as unknown as Buffer;
    }

    async listBlobs(prefix = ''): Promise<string[]> {
        const results: string[] = [];
        // for (const name of this.blobs.keys()) {
        //     // console.log(`checking ${name}`);
        //     if (name.startsWith(prefix)) {
        //         results.push(name);
        //     }
        // }

        // TODO: May want to modify this to a recursive directory walk.
        const translated = this.translatePath(prefix);
        if (fs.existsSync(translated)) {
            return [...fs.readdirSync(this.translatePath(prefix))];
        } else {
            // TODO: change API to distinguish between path not found and empty directory.
            return [];
        }
    }

    translatePath(localPath: string) {
        const normalized = path.posix.resolve('/', path.posix.normalize(localPath));
        const relative = path.posix.relative('/', normalized);
        const resolved = path.resolve(this.root, relative);
        const fullPath = path.normalize(resolved);
        // console.log();
        // console.log(`localPath = ${localPath}`);
        // console.log(`normalized = ${normalized}`);
        // console.log(`relative = ${relative}`);
        // console.log(`resolved = ${resolved}`);
        // console.log(`fullpath=${fullPath}`);
        return fullPath;
    }
}

function go() {
//    const disk = new LocalDisk('c:\\temp\\einstein');
    const disk = new LocalDisk('/Users/mhop/git/temp');

    // TODO: Save for unit tests **********************************************
    // disk.translatePath('../a');
    // disk.translatePath('/a');
    // disk.translatePath('a');
    // disk.translatePath('a/b');
    // disk.translatePath('c:\\temp\\foo');
}

// go();
