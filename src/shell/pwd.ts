import { Shell } from './shell';

export async function pwdCommand(args: string[], shell: Shell): Promise<number> {
    console.log(shell.getWorld().cwd);
    return 0;
}
