import * as path from 'path';

import { Shell } from './shell';

export async function moreCommand(args: string[], shell: Shell): Promise<number> {
    if (args.length !== 2) {
        console.log('more: expected a filename');
        return 0;
    } else {
        const cwd = shell.getWorld().cwd;
        const storage = shell.getWorld().localStorage;
        const filePath = path.posix.join(cwd, args[1]);
        const fileData = await storage.readBlob(filePath);
        console.log(fileData.toString('utf8'));
        return 0;
    }
}
