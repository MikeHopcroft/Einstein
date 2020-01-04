import { Shell } from './shell';

export function lsCommand(args: string[], shell: Shell): number {
    console.log(`ls`);
    for (let i=1; i<args.length; ++i) {
        console.log(`  ${args[i]}`);
    }
    return 0;
}
