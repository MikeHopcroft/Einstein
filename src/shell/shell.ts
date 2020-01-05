import * as fs from 'fs';
import * as readline from 'readline';
import { Readable } from 'stream';

import { CLI } from '../cli';
import {
    IOrchestrator,
    IStorage,
    IWorker,
    LocalDisk,
    LocalOrchestrator,
    RamDisk
} from '../cloud';

import { cdCommand } from './cd';
import { einsteinCommand } from './einstein';
import { imagesCommand } from './images';
import { lsCommand } from './ls';
import { moreCommand } from './more';
import { pwdCommand } from './pwd';
import { servicesCommand } from './services';

type CommandEntryPoint = (args: string[], shell: Shell) => Promise<number>;

const maxHistorySteps = 1000;
const historyFile = '.repl_history';
const homedir = '/';

export class Shell {
    private commands = new Map<string, CommandEntryPoint>();
    private cwd: string;

    private orchestrator: IOrchestrator;
    private cloudStorage: IStorage;
    private localStorage: IStorage;
    private cli: CLI;

    private rl: readline.Interface;

    private capture = new StdoutCapture();

    constructor(input: Readable | undefined = process.stdin) {
        this.capture.start();

        const shell = this;

        this.cwd = homedir;

        this.registerCommand('cd', cdCommand);
        this.registerCommand('einstein', einsteinCommand);
        this.registerCommand('images', imagesCommand);
        this.registerCommand('ls', lsCommand);
        this.registerCommand('more', moreCommand);
        this.registerCommand('pwd', pwdCommand);
        this.registerCommand('services', servicesCommand);

        this.orchestrator = new LocalOrchestrator();
        this.cloudStorage = new RamDisk();
        this.localStorage = new LocalDisk('/Users/mhop/git/temp');
        this.cli = new CLI(
            this.orchestrator, 
            this.cloudStorage,
            this.localStorage
        );

        // Print the welcome message.
        console.log();
        console.log('Welcome to the Einstein interactive command shell.');
        console.log('Type commands below.');
        console.log('A blank line exits.');
        console.log();
        console.log('Type "help" for information on commands.');
        console.log();

        // Start up the REPL.
        const rl = readline.createInterface({
            input,
            output: process.stdout,
            prompt: this.getPrompt()
        });
        this.rl = rl;

        rl.prompt();
        rl.on('line', async (line: string) => {
            if (line === '') {
                rl.close();
            } else {
                await processOneInputLine(line);
            }
        });

        rl.on('close', () => {
            console.log();
            console.log('bye');

            this.capture.stop();
            console.log('===============');
            console.log(this.capture.output);
            process.exit(0);
        });

        async function processOneInputLine(line: string) {
            // Need await for interactive.
            // Need to lose await for input2 driven
            // Perhaps need to slow down input2 with non-zero sleeps
            await shell.processLine(line);
            rl.prompt();
        }

        // async function processInputLine(line: string) {
        //     const lines = line.split(/[\n\r]/);
        //     if (lines[lines.length - 1].length === 0) {
        //         // Remove last empty line so that we can distinguish whether
        //         // we're in interactive mode or doing a .load.
        //         lines.pop();
        //     }
        //     // console.log(`lines.length=${lines.length}`);
        //     for (line of lines) {
        //         // console.log(`lines.length=${lines.length}`);
        //         if (line.length > 0) {
        //             // Only process lines that have content.
        //             // In an interactive session, an empty line will exit.
        //             // When using .load, empty lines are ignored.

        //             if (lines.length > 1) {
        //                 // When we're processing multiple lines, for instance
        //                 // via the .load command, print out each line before
        //                 // processing.
        //                 console.log(`% (batch) ${line}`);
        //                 console.log();
        //             }

        //             shell.processLine(line);
        //             rl.prompt();
        //         }
        //     }
        // }

        // // Load REPL history from file.
        // if (fs.existsSync(historyFile)) {
        //     fs.readFileSync(historyFile)
        //         .toString()
        //         // Split on \n (linux) or \r\n (windows)
        //         .split(/\n|\r|\r\n|\n\r/g)
        //         .reverse()
        //         .filter((line: string) => line.trim())
        //         // tslint:disable-next-line:no-any
        //         .map((line: string) => (repl as any).history.push(line));
        // }
    }

    registerCommand(name: string, entryPoint: CommandEntryPoint) {
        if (this.commands.has(name)) {
            const message = `Attempting to register duplicate command "${name}"`;
            throw TypeError(message);
        } else {
            this.commands.set(name, entryPoint);
        }
    }

    getCLI() {
        return this.cli;
    }

    getHomeDirectory() {
        return homedir;
    }

    getWorkingDirectory() {
        return this.cwd;
    }

    setWorkingDirectory(cwd: string) {
        this.cwd = cwd;
        this.updatePrompt();
    }

    getLocalStorage() {
        return this.localStorage;
    }

    getOrchestrator() {
        return this.orchestrator;
    }

    private getPrompt() {
        return `einstein:${this.cwd}% `;
    }

    private updatePrompt() {
        this.rl.setPrompt(this.getPrompt());
    }

    private async processLine(line: string) {
        if (!line.trim().startsWith('#')) {
            // TODO: better arg splitter that handles quotes.
            const args = line.split(/\s+/);
            const command = this.commands.get(args[0]);
            if (command === undefined) {
                console.log(`${args[0]}: command not found`)
            } else {
                await command(args, this);
            }
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
//
// Sample application after this point
//
///////////////////////////////////////////////////////////////////////////////
async function clientEntryPoint(worker: IWorker) {
    // await sleep(2000);
    console.log(`client: clientEntryPoint()`);
}

async function serverEntryPoint(worker: IWorker) {
    // await sleep(2000);
    console.log(`server: serverEntryPoint()`);
}

// https://stackoverflow.com/questions/32719923/redirecting-stdout-to-file-nodejs
// https://stackoverflow.com/questions/43505223/a-node-shell-based-on-gnu-readline/43677273

function go() {
    const input2 = new Readable();
    input2.push('cd a\n');
    input2.push('cd b\n');
    input2.push('pwd\n');
    input2.push(null);

    // const lines: string[] = [];
    // const stopping = false;
    // const originalWriter = process.stdout.write;

    // //https://stackoverflow.com/questions/26675055/nodejs-parse-process-stdout-to-a-variable
    // // tslint:disable-next-line:no-any
    // function writer(data: any) {
    //     originalWriter(data);
    // }

    // // tslint:disable-next-line:no-any
    // process.stdout.write = writer as any;

    // // process.stdout.write = (data) => {
    // //   // mylogger.write(data);
    // //   process.stdout._orig_write(data);
    // // }    // process.stdout.on('data', (chunk: string) => {
    // //     if (!stopping) {
    // //         lines.push(chunk);
    // //     }
    // // });


    // const shell = new Shell(input2);
    const shell = new Shell();
    const orchestrator = shell.getOrchestrator();

    // Push client container image to repository.
    const clientImage = {
        tag: 'client:1.0',
        create: () => clientEntryPoint
    };
    orchestrator.pushImage(clientImage);

    // Push server container image to repository.
    const serverImage = {
        tag: 'server:1.0',
        create: () => serverEntryPoint
    };
    orchestrator.pushImage(serverImage);
}

// https://medium.com/@gajus/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d
class StdoutCapture {
    output = '';
    write = process.stdout.write.bind(process.stdout);

    start() {
        const context = this;

        // https://medium.com/@gajus/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d
        function hook(
            chunk: string | Buffer,
            // tslint:disable-next-line:no-any
            encoding: any,
            callback: Function
        ) {
            if (typeof chunk === 'string') {
                context.output += chunk;
            }
            return context.write(chunk as string, encoding, callback);
        }

        // tslint:disable-next-line:no-any
        process.stdout.write = hook as any;
    }

    stop() {
        process.stdout.write = this.write;
    }
}

function go3() {
    let output = '';

    const originalStdoutWrite = process.stdout.write.bind(process.stdout);

    // https://medium.com/@gajus/capturing-stdout-stderr-in-node-js-using-domain-module-3c86f5b1536d
    function f(
        chunk: string | Buffer,
        // tslint:disable-next-line:no-any
        encoding: any,
        callback: Function
    ) {
        if (typeof chunk === 'string') {
            output += chunk;
        }
        return originalStdoutWrite(chunk as string, encoding, callback);
    }

    // tslint:disable-next-line:no-any
    process.stdout.write =  f as any;

    console.log('foo');
    console.log('bar');
    console.log('baz');

    process.stdout.write = originalStdoutWrite;
    console.log('qux');
    console.log(output);
}

go();
