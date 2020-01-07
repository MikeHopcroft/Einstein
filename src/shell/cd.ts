import * as path from 'path';

import { Shell } from './shell';

export async function cdCommand(args: string[], shell: Shell): Promise<number> {
    if (args.length === 1) {
        shell.setWorkingDirectory(shell.getWorld().homedir);
        return 0;
    } else if (args.length === 2) {
        shell.setWorkingDirectory(
            path.posix.resolve(shell.getWorld().cwd, args[1])
        );
        return 0;
    } else {
        console.log('cd command expects 0 or 1 arguments.');
        return 1;
    }
}
