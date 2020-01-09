export type CommandEntryPoint = (args: string[]) => Promise<number>;

export interface CommandDescription {
    name: string,
    args: string[],
    description: string,
    entryPoint: CommandEntryPoint | Commands
}

// tslint:disable-next-line:interface-name
export interface ICommand {
    run(context: string, args: string[]): Promise<number>;
    completions(prefix: string): IterableIterator<string>;
}

export class Commands implements ICommand {
    commands = new Map<string, CommandDescription>();

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
                        if (entryPoint instanceof Commands) {
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
                    if (command.entryPoint instanceof Commands) {
                        // Prepare to delegate to next command processor
                        yield name + ' ';
                    } else {
                        // TODO: delegate to command itself.
                    }
                } else {
                    yield name;
                }
            } else if (prefix.startsWith(name + ' ')) {
                if (command.entryPoint instanceof Commands) {
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
            throw TypeError(message);
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


            // if (entryPoint instanceof Commands) {

            // } else {
            //     this.commands.set(name, entryPoint);
            // }
