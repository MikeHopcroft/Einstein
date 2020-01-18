import * as readline from 'readline';

export type CommandEntryPoint = (args: string[]) => Promise<number>;

export interface CommandDescription {
    name: string,
    args: string[],
    description: string,
    entryPoint: CommandEntryPoint | CommandDispatcher
}

// tslint:disable-next-line:interface-name
export interface ICommand {
    name: string,
    description: string,

    run(context: string, args: string[]): Promise<number>;
    completions(prefix: string): IterableIterator<string>;
}

export class CommandDispatcher implements ICommand {
    name: string;
    description: string;

    commands = new Map<string, CommandDescription>();

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    register(commands: CommandDescription[] | CommandDescription) {
        if (commands instanceof Array) {
            for (const command of commands) {
                this.registerOne(command);
            }
        } else {
            this.registerOne(commands);
        }
    }

    async run(context: string, args: string[]): Promise<number> {
        if (args.length < 2) {
            this.usage();
            return 0;
        } else {
            const cmdText = args[1];
            for (const command of this.commands.values()) {
                if (cmdText === command.name) {
                    try {
                        const entryPoint = command.entryPoint;
                        if (entryPoint instanceof CommandDispatcher) {
                            return entryPoint.run(args[0], args.slice(1));
                        } else {
                            // TODO: restore
                            // return entryPoint(context, args);
                        }
                    } catch (e) {
                        if (e instanceof TypeError) {
                            console.log(e.message);
                            return 1;
                        } else {
                            throw e;
                        }
                    }
                }
            }
            console.log(`: unknown command '${cmdText}'`);
            return 1;
        }
    }

    *completions(prefix: string): IterableIterator<string> {
        for (const command of this.commands.values()) {
            const name = command.name;
            if (name.startsWith(prefix)) {
                if (name.length === prefix.length) {
                    if (command.entryPoint instanceof CommandDispatcher) {
                        // Prepare to delegate to next command processor
                        yield name + ' ';
                    } else {
                        // TODO: delegate to command itself.
                    }
                } else {
                    yield name;
                }
            } else if (prefix.startsWith(name + ' ')) {
                if (command.entryPoint instanceof CommandDispatcher) {
                    // Delgate to next command processor
                    yield* command.entryPoint.completions(prefix.slice(name.length + 1));
                }
            }
        }
    }

    private registerOne(command: CommandDescription) {
        const name = command.name;
        if (this.commands.has(name)) {
            const message =
                `Attempting to register duplicate command "${name}"`;
            throw new TypeError(message);
        } else {
            this.commands.set(name, command);
        }
    }

    private usage() {
        console.log('Here are some einstein commands:');
        console.log();
        for (const command of this.commands.values()) {
            console.log(`einstein ${command.name} ${formatArgs(command.args)}`);
            console.log(`  ${command.description}`);
            console.log();
        }
        return 0;
    }
}

function formatArgs(args: string[]) {
    return args.map(x => `<${x}>`).join(' ');
}

type Completer = (prefix: string, lastWord: boolean) => IterableIterator<string>;

export class CommandBase {
    name: string;
    completers: Completer[];

    constructor(name: string, completers: Completer[]) {
        this.name = name;
        this.completers = completers;
    }

    *completions(prefix: string): IterableIterator<string> {
        const words = prefix.split(/\s+/);
        if (words.length > this.completers.length) {
            // Too many words in the prefix to match a completion.
            return;
        }

        for (let i = 0; i < words.length - 1; ++i) {
            const c = [...this.completers[i](words[i], false)];
            if (!c.includes(words[i])) {
                // This sequence of words does not match any completions.
                return;
            }
        }

        // We have matched all but the last word.
        // Now find completions for last word.
        const word = words[words.length - 1];
        const completer = this.completers[words.length - 1];
        const left = words.slice(0, -1).join(' ');
        for (const c of completer(word, true)) {
            yield left + ' ' + c;
        }
    }
}

function printCompletions(prefix: string, completer: CommandBase) {
    console.log(`Completions for "${prefix}":`);
    for (const completion of completer.completions(prefix)) {
        console.log(`  "${completion}"`);
    }
}

function go() {
    function *lsCompleter(prefix: string, lastWord: boolean): IterableIterator<string> {
        const x = 'ls';
        if (x.startsWith(prefix)) {
            if (x.length === prefix.length) {
                // yield x;
                if (lastWord) {
                    yield x + ' ';
                } else {
                    yield x;
                }
            } else {
                yield x;
            }
        }
    }

    function *fileCompleter(prefix: string, lastWord: boolean): IterableIterator<string> {
        const files = ['abc', 'aardvark', 'airplane', 'auto', 'train'];
        for (const x of files) {
            if (x.startsWith(prefix)) {
                if (x.length === prefix.length) {
                    if (lastWord) {
                        yield x + ' ';
                    } else {
                        yield x;
                    }
                } else {
                    yield x;
                }
            }
        }
    }

    const x: Completer[] = [lsCompleter, fileCompleter];
    const y: Completer = lsCompleter;
    function *foo(): IterableIterator<string> {yield 'hello'};
    const z: Completer = foo;
    const cmds = new CommandBase('xyz,', [lsCompleter, fileCompleter]);
    const cases = ['ls t', 'l', 'ls', 'ls ', 'ls a', 'ls ab', 'ls t', 'ls train', 'ls train '];
    for (const c of cases) {
        printCompletions(c, cmds);
    }

    // const completer = (prefix: string) => {
    //     return [[...cmds.completions(prefix)], prefix];
    // }

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    //     completer
    // });

    // rl.prompt();
    // rl.on('line', async (line: string) => {
    //     if (line === '') {
    //         rl.close();
    //         console.log('bye');
    //     } else {
    //         console.log(`Input: "${line}"`);
    //         rl.prompt();
    //     }
    // });

}

go()
