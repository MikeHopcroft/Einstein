import * as path from 'path';

import { World } from '../cloud';

interface CommandDescription {
    name: string,
    args: string[],
    description: string,
    command: (args: string[]) => Promise<number>
}

export class CloudMain {
    commands: CommandDescription[];

    world: World;
    cwd: string;

    constructor(world: World) {
        this.world = world;
        this.cwd = '/';

        const context = this;
        this.commands = [
            {
                name: 'ls',
                args: [],
                description: 'List blobs',
                command: context.lsCommand
            },
        ];
    }

    async lsCommand(args: string[]): Promise<number> {
        const cwd = this.cwd;
        const storage = this.world.cloudStorage;

        let p = cwd;
        if (args.length > 1) {
            p = path.posix.join(cwd, args[1]);
        }

        const blobs = await storage.listBlobs(p);
        if (blobs.length === 0) {
            // TODO: BUGBUG: args[1] is not always defined.
            // Can get to this case after cd to bad directory.
            console.log(`cloud ls: ${args[1]}: No such file or directory`);
        } else {
            for (const blob of blobs) {
                const relative = path.posix.relative(cwd, blob);
                console.log(relative);
            }
        }

        return 0;
    }


    async helpCommand(args: string[]): Promise<number> {
        console.log('Here are some cloud commands:');
        console.log();
        for (const command of this.commands) {
            console.log(`cloud ${command.name} ${formatArgs(command.args)}`);
            console.log(`  ${command.description}`);
            console.log();
        }
        return 0;
    }

    async run(args: string[]): Promise<number> {
        if (args.length < 2) {
            this.usage();
            return 0;
        } else {
            const cmdText = args[1];
            for (const command of this.commands) {
                if (cmdText === command.name) {
                    const cmdArgs = args.slice(2);
                    if (cmdArgs.length === command.args.length) {
                        try {
                            return await command.command.call(this, cmdArgs);
                        } catch (e) {
                            if (e instanceof TypeError) {
                                console.log(e.message);
                                return 1;
                            } else {
                                throw e;
                            }
                        }
                    } else {
                        console.log(`Expected ${command.args.length} arguments:`);
                        console.log(`  cloud ${command.name} ${formatArgs(command.args)}`);
                        return 1;
                    }
                }
            }
            console.log(`cloud: unknown command '${cmdText}'`);
            return 1;
        }
    }

    usage() {
        console.log('TODO: show cloud command usage');
    }
}

function formatArgs(args: string[]) {
    return args.map(x => `<${x}>`).join(' ');
}

// function fullPath(cwd: string, relative: string) {
//     return path.posix.join(cwd, relative);
// }
