import * as path from 'path';

import { World } from '../cloud';

export async function moreCommand(args: string[], world: World): Promise<number> {
    if (args.length !== 2) {
        console.log('more: expected a filename');
        return 1;
    } else {
        const cwd = world.cwd;
        const storage = world.localStorage;
        const filePath = path.posix.join(cwd, args[1]);
        const fileData = await storage.readBlob(filePath);
        console.log(fileData.toString('utf8'));
        return 0;
    }
}
