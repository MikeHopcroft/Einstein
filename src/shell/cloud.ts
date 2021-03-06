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
            {
                name: 'more',
                args: ['blob'],
                description: 'Display content of a blob',
                command: context.moreCommand
            },
        ];
    }

    async lsCommand(args: string[]): Promise<number> {
        const storage = this.world.cloudStorage;

        let p = this.cwd;
        if (args.length > 1) {
            p = path.posix.join(this.cwd, args[1]);
        }

        const blobs = await storage.listBlobs(p);
        blobs.sort();
        if (blobs.length === 0) {
            // TODO: BUGBUG: args[1] is not always defined.
            // Can get to this case after cd to bad directory.
            if (args.length > 1) {
                console.log(`cloud ls: ${args[1]}: No blobs matchign prefix`);
            } else {
                console.log(`cloud ls: no blobs in cloud storage`);
            }
        } else {
            for (const blob of blobs) {
                const relative = path.posix.relative(this.cwd, blob);
                console.log(relative);
            }
        }

        return 0;
    }

    async moreCommand(args: string[]): Promise<number> {
        if (args.length !== 1) {
            console.log(`cloud more: expected a filename: ${args}`);
            return 1;
        } else if (args[0].includes('*')) {
            // TODO: really want to escape re syntax here.
            const reArg = args[0].replace('*', '.+');
            // Special case for demo.
            // Use regular expression matching to display multiple files.
            // This is essential for the demo script, since we don't know
            // the uuid values before the run.
            const pattern = path.posix.join(this.cwd, reArg);
            const re = new RegExp(pattern);
            const storage = this.world.cloudStorage;
            const blobs = await storage.listBlobs('');
            for (const filePath of blobs) {
                if (filePath.match(re)) {
                    console.log(`=== Contents of ${filePath} ===`);
                    const fileData = await storage.readBlob(filePath);
                    console.log(fileData.toString('utf8'));       
                    console.log();
                }
            }
            return 0;
        } else {
            const storage = this.world.cloudStorage;
            const filePath = path.posix.join(this.cwd, args[0]);
            const fileData = await storage.readBlob(filePath);
            console.log(fileData.toString('utf8'));
            return 0;
        }
    }
    
    async helpCommand(args: string[]): Promise<number> {
        this.printHelp();
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

    private usage() {
        console.log('cloud usage:');
        console.log();
        this.printHelp();
    }

    private printHelp() {
        console.log('Here are some cloud commands:');
        console.log();
        for (const command of this.commands) {
            console.log(`cloud ${command.name} ${formatArgs(command.args)}`);
            console.log(`  ${command.description}`);
            console.log();
        }
    }
}

function formatArgs(args: string[]) {
    return args.map(x => `<${x}>`).join(' ');
}

// function go() {
//     const blobs: string[] = [
//         '/logs/c123',
//         '/logs/b123'
//     ];
//     const cwd = '/';
//     const arg = 'logs/b.+';

//     const pattern = path.posix.join(cwd, arg);
//     const re = new RegExp(pattern);
//     for (const filePath of blobs) {
//         const matches = filePath.match(re);
//         if (matches) {
//             console.log(matches);
//             console.log(`=== Contents of ${filePath} ===`);
//         }
//     }
// }

// go();
