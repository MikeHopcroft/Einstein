import { Shell } from './shell';

export async function containersCommand(args: string[], shell: Shell): Promise<number> {
    console.log(`containers`);
    for (let i=1; i<args.length; ++i) {
        console.log(`  ${args[i]}`);
    }
    return 0;
}
