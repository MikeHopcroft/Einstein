import * as path from 'path';

import { Shell } from './shell';

export function cdCommand(args: string[], shell: Shell): number {
    if (args.length === 1) {
        shell.setWorkingDirectory(shell.getHomeDirectory());
        return 0;
    } else if (args.length === 2) {
        shell.setWorkingDirectory(
            path.posix.resolve(shell.getWorkingDirectory(),args[1])
        );
        return 0;
    } else {
        console.log('cd command expects 0 or 1 arguments.');
        return 1;
    }
}
