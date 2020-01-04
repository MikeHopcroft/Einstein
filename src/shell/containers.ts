import { Shell } from './shell';

export function containersCommand(args: string[], shell: Shell): number {
    console.log(`containers`);
    for (let i=1; i<args.length; ++i) {
        console.log(`  ${args[i]}`);
    }
    return 0;
}
