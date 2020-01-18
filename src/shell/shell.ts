import * as readline from 'readline';
import { Readable } from 'stream';

import { CLI, CLIMain } from '../cli';

import { World } from '../cloud';

import { StdoutCapture } from '../utilities';

import { cdCommand } from './cd';
import { CloudMain } from './cloud';
import { imagesCommand } from './images';
import { lsCommand } from './ls';
import { moreCommand } from './more';
import { pwdCommand } from './pwd';
import { servicesCommand } from './services';

// Shell commands are implemented as CommandEntryPoints.
// The return value is the standard bash shell return code.
type CommandEntryPoint = (args: string[], world: World) => Promise<number>;

const maxHistorySteps = 1000;
const historyFile = '.repl_history';

export class Shell {
    // Map of shell commands (e.g. cd, ls, pwd, einstein, etc.)
    private commands = new Map<string, CommandEntryPoint>();
    private completions: string[] = [];

    private world: World;

    // The current working directory (CWD) displayed in the prompt.
    private promptCwd: string;

    // Einstein CLI application. Used for the 'einstein' command.
    private cli: CLI;
    private einstein: CLIMain;
    private cloud: CloudMain;

    // REPL is based on Node's readline.Interface class.
    private rl: readline.Interface;

    // This promise is resolved when the REPL exits.
    private finishedPromise: Promise<unknown>;

    // When enabled, captures stdout to a string.
    private capture = new StdoutCapture();

    constructor(
        world: World,
        options: {
            input?: Readable
            capture?: boolean
        } | undefined = {}
    ) {
        this.world = world;

        // Initialize promptCwd with '' to force initialization in displayPrompt().
        this.promptCwd = '';

        const input = options.input || process.stdin;

        // Start capturing stdout.
        if (options.capture) {
            this.capture.start();
        }

        // Alias for `this` to be used in processOneInputLine where
        // `this` is bound differntly.
        const shell = this;

        // Register shell commands.
        this.registerCommand('cd', cdCommand);
        this.registerCommand('cloud', this.cloudCommand);
        this.registerCommand('einstein', this.einsteinCommand);
        this.registerCommand('exit', this.exitCommand);
        this.registerCommand('help', this.helpCommand);
        this.registerCommand('images', imagesCommand);
        this.registerCommand('ls', lsCommand);
        this.registerCommand('more', moreCommand);
        this.registerCommand('pwd', pwdCommand);
        this.registerCommand('services', servicesCommand);

        // Construct CLI used by the einstein command.
        this.cli = new CLI(this.world);
        this.einstein = new CLIMain(this.cli, this.world);
        this.cloud = new CloudMain(this.world);

        // Print the welcome message.
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
            completer: this.completer
        });
        this.rl = rl;

        // Display first prompt.
        this.displayPrompt();

        // Register line input handler.
        rl.on('line', async (line: string) => {
            if (line.trim() === 'exit') {
                rl.close();
            } else {
                await processOneInputLine(line);
            }
        });

        // Set up promise that resolves when rl closes.
        this.finishedPromise = new Promise((resolve, reject) => {
            rl.on('close', () => {
                console.log();
                console.log('bye');
                this.capture.stop();
                resolve();
            });
        });

        async function processOneInputLine(line: string) {
            if (line.trim() !== '') {
                // Process the current line.
                await shell.processLine(line);
            }

            // Show next prompt.
            shell.displayPrompt();
        }

        // TODO: reinstate this code and code to write history on close.
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
            const message =
                `Attempting to register duplicate command "${name}"`;
            throw new TypeError(message);
        } else {
            this.commands.set(name, entryPoint);
            this.completions.push(name + ' ');
        }
    }

    // Returns a promise that resolves when the interactive shell exits.
    finished(): Promise<unknown> {
        return this.finishedPromise;
    }

    getCLI() {
        return this.cli;
    }

    getWorld() {
        return this.world;
    }

    getOrchestrator() {
        return this.world.orchestrator;
    }

    getOutput() {
        return this.capture.output;
    }

    private completer = (line: string) => {
        // TODO: HACK: replace this code with real completions algorithm.
        const completions = [
            'einstein create ',
            'einstein create benchmark.yaml',
            'einstein create candidate.yaml',
            'einstein create suite.yaml',
            
            // 'einstein benchmark ',
            // 'einstein benchmark benchmark.yaml',
            // 'einstein candidate ',
            // 'einstein candidate candidate.yaml',
            'einstein deploy ',
            'einstein deploy lab',
            'einstein help',
            // 'einstein suite ',
            // 'einstein suite suite.yaml',
            'einstein run ',
            'einstein run true_or_false_candidate:1.0 ',
            'einstein run true_or_false_candidate:1.0 True_Or_False',
            'einstein run alwaysTrue_candidate:1.0 ',
            'einstein run alwaysTrue_candidate:1.0 True_Or_False',
            'einstein run alwaysFalse_candidate:1.0 ',
            'einstein run alwaysFalse_candidate:1.0 True_Or_False',
            'einstein list ',
            'einstein list candidates',
            'einstein list benchmarks',
            'einstein list suites',
            'einstein list runs',
            'einstein ',
            // 'benchmark.yaml',
            // 'candidate.yaml',
            // 'suite.yaml',
            // 'benchmark',
            // 'candidate',
            // 'suite',
            // 'list',
            'cloud ',
            'cloud ls',
            'cloud more suites/aht7ataz9xt5yhk1dhtpa',
            'cloud more benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0',
            'cloud more candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0',
            'cloud more logs/lab',
            'images',
            'ls',
            'more ',
            'more candidate.yaml',
            'more benchmark.yaml',
            'more suite.yaml',
            'services',
        ];
        const hits = completions.filter((c) => c.startsWith(line));
        // console.log(`line="${line}", hits=${hits}`);
        return [hits, line];
    }
    
    private displayPrompt() {
        if (this.promptCwd !== this.world.cwd) {
            this.promptCwd = this.world.cwd;
            this.rl.setPrompt(`einstein:${this.world.cwd}% `);
        }
        this.rl.prompt();
    }

    private async processLine(line: string) {
        if (!line.trim().startsWith('#')) {
            // TODO: better arg splitter that handles quotes.
            const args = line.trim().split(/\s+/);
            const command = this.commands.get(args[0]);
            if (command === undefined) {
                console.log(`${args[0]}: command not found`)
            } else {
                await command(args, this.world);
            }
            console.log();
        }
    }

    private einsteinCommand = async (args: string[], world: World): Promise<number> => {
        return this.einstein.run(args);
    }

    private exitCommand = async (args: string[], world: World): Promise<number> => {
        this.rl.close();
        return 0;
    }

    private cloudCommand = (args: string[], world: World) => {
        return this.cloud.run(args);
    }

    private helpCommand = async (args: string[], world: World): Promise<number> => {
        console.log('Available shell commands:');
        for (const command of this.commands.keys()) {
            console.log(`  ${command}`);
        }
        return 0;
    }
}
