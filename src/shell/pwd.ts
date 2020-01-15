import { World } from '../cloud';

export async function pwdCommand(args: string[], world: World): Promise<number> {
    console.log(world.cwd);
    return 0;
}
