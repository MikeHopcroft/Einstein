import * as path from 'path';

import { Shell } from './shell';

export async function lsCommand(args: string[], shell: Shell): Promise<number> {
    const cwd = shell.getWorkingDirectory();
    const storage = shell.getLocalStorage();

    let p = cwd;
    if (args.length > 1) {
        p = path.posix.join(cwd, args[1]);
    }

    const blobs = await storage.listBlobs(p);
    if (blobs.length === 0) {
        // TODO: BUGBUG: args[1] is not always defined.
        // Can get to this case after cd to bad directory.
        console.log(`ls: ${args[1]}: No such file or directory`);
    } else {
        for (const blob of blobs) {
            console.log(blob);
        }
    }

    return 0;
}
