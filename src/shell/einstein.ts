import { Shell } from './shell';
import { ClientRequest } from 'http';

export async function einsteinCommand(args: string[], shell: Shell): Promise<number> {
    // console.log(`einstein`);
    // for (let i=1; i<args.length; ++i) {
    //     console.log(`  ${args[i]}`);
    // }

    if (args.length === 3 && args[1]==='deploy') {
        const hostname = args[2];
        const cli = shell.getCLI();
        console.log(`Deploying to ${hostname}.`)
        cli.deploy(hostname);
    } else if (args.length === 2 && args[1]==='encrypt') {
        const cli = shell.getCLI();
        await cli.encrypt('filename');
    } else {
        console.log(`einstein: invalid command`);
    }
    return 0;
}
