import { CLI } from './cliCore';

export class CLIArgs {
    cli: CLI;

    constructor(cli: CLI) {
        this.cli = cli;
    }

    async main(args:string[]): Promise<number> {
        if (args.length === 1) {
            this.usage();
        } else if (args.length > 1) {
            switch (args[1]) {
                case 'deploy':
                    break;
                case 'encrypt':
                    break;
                default:
                    console.log(`einstein: unknown command "${args[1]}"`);
            }
        }

        return 0;
    }

    usage() {
        // TODO: implement
        console.log('Print usage here');
    }
}
