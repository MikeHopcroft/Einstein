import { Shell } from './shell';

export function moreCommand(args: string[], shell: Shell): number {
    console.log(`more`);
    for (let i=1; i<args.length; ++i) {
        console.log(`  ${args[i]}`);
    }
    return 0;
}
