import { Shell } from './shell';

export async function moreCommand(args: string[], shell: Shell): Promise<number> {
    console.log(`more`);
    for (let i=1; i<args.length; ++i) {
        console.log(`  ${args[i]}`);
    }
    return 0;
}
