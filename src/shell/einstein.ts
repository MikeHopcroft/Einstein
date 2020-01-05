import { Shell } from './shell';

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
        // console.log(`Deployed successfully.`)
    }
    return 0;
}
