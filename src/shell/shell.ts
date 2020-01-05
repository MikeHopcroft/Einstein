// TODO: implement REPL shell here.
// Commands:
//   einstein
//   ls
//   pwd
//   more
//   cd
//   containers


// import * as style from 'ansi-styles';
// import * as Debug from 'debug';
import * as fs from 'fs';
import * as replServer from 'repl';
import { Context } from 'vm';

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

export class Shell /* implements IRepl */ {
    private commands = new Map<string, CommandEntryPoint>();
    private cwd: string;

    private orchestrator: IOrchestrator;
    private cloudStorage: IStorage;
    private localStorage: IStorage;
    private cli: CLI;

    private repl: replServer.REPLServer;

    constructor() {
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
        console.log('Type your order below.');
        console.log('A blank line exits.');
        console.log();
        console.log('Type .help for information on commands.');
        console.log();

        // Start up the REPL.
        const repl = replServer.start({
            prompt: this.getPrompt(),
            input: process.stdin,
            output: process.stdout,
            eval: processReplInput,
            writer: myWriter,
        });
        this.repl = repl;
        this.updatePrompt();

        // Load REPL history from file.
        if (fs.existsSync(historyFile)) {
            fs.readFileSync(historyFile)
                .toString()
                // Split on \n (linux) or \r\n (windows)
                .split(/\n|\r|\r\n|\n\r/g)
                .reverse()
                .filter((line: string) => line.trim())
                // tslint:disable-next-line:no-any
                .map((line: string) => (repl as any).history.push(line));
        }

        //
        // Register core commands.
        //

        repl.on('exit', () => {
            // tslint:disable:no-any
            const historyItems = [...(repl as any).history].reverse();
            const history = historyItems
                .slice(Math.max(historyItems.length - maxHistorySteps, 0))
                .join('\n');
            fs.writeFileSync(historyFile, history);
            console.log('bye');
            process.exit();
        });

        async function processReplInput(
            line: string,
            context: Context,
            filename: string,
            // tslint:disable-next-line:no-any
            callback: (err: Error | null, result: any) => void
        ) {
            console.log();

            if (line === '\n') {
                repl.close();
            } else {
                await processInputLine(line);
                callback(null, '');
            }
        }

        async function processInputLine(line: string) {
            const lines = line.split(/[\n\r]/);
            if (lines[lines.length - 1].length === 0) {
                // Remove last empty line so that we can distinguish whether
                // we're in interactive mode or doing a .load.
                lines.pop();
            }
            for (line of lines) {
                if (line.length > 0) {
                    // Only process lines that have content.
                    // In an interactive session, an empty line will exit.
                    // When using .load, empty lines are ignored.

                    if (lines.length > 1) {
                        // When we're processing multiple lines, for instance
                        // via the .load command, print out each line before
                        // processing.
                        console.log(`% (batch) ${line}`);
                        console.log();
                    }

                    shell.processLine(line);
                }
            }
        }

        function myWriter(text: string) {
            return text;
        }
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
        // HACK: use knowledge of private member of ReplServer
        // to change the prompt.
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
        (this.repl as any)['_initialPrompt'] = this.getPrompt();
    }

    private async processLine(line: string) {
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

function go() {
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

go();
