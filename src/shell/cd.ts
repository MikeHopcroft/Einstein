import * as path from 'path';

import { World } from '../cloud';

export async function cdCommand(args: string[], world: World): Promise<number> {
    if (args.length === 1) {
        // cd with no parameters goes to the homedir
        world.cwd = world.homedir;
        return 0;
    } else if (args.length === 2) {
        world.cwd = path.posix.resolve(world.cwd, args[1]);
        return 0;
    } else {
        console.log('cd command expects 0 or 1 arguments.');
        return 1;
    }
}
