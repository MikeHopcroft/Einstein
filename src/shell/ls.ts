import * as path from 'path';

import { World } from '../cloud';

export async function lsCommand(args: string[], world: World): Promise<number> {
    const cwd = world.cwd;
    const storage = world.localStorage;

    let p = cwd;
    if (args.length > 1) {
        p = path.posix.join(cwd, args[1]);
    }

    const blobs = await storage.listBlobs(p);
    blobs.sort();
    if (blobs.length === 0) {
        // TODO: BUGBUG: args[1] is not always defined.
        // Can get to this case after cd to bad directory.
        console.log(`ls: ${args[1]}: No such file or directory`);
    } else {
        for (const blob of blobs) {
            const relative = path.relative(cwd, blob);
            console.log(relative);
        }
    }

    return 0;
}
