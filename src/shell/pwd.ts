import { Shell } from './shell';

export async function pwdCommand(args: string[], shell: Shell): Promise<number> {
    console.log(shell.getWorkingDirectory());
    // console.log(`pwd`);
    // for (let i=1; i<args.length; ++i) {
    //     console.log(`  ${args[i]}`);
    // }
    return 0;
}
