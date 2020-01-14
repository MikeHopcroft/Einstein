import * as path from 'path';

import { CLI } from '.';
import { World, IStorage } from '../cloud';
import { Shell } from '../shell';
import { listCommandInternal } from './list';

interface CommandDescription {
    name: string,
    args: string[],
    description: string,
    command: (args: string[]) => Promise<number>
}

export class CLIMain {
    commands: CommandDescription[];

    cli: CLI;
    cwd: string;

    // TODO: remove this temporary hack.
    // Code should connect to analysis service.
    cloudStorage: IStorage;

    constructor(cli: CLI, world: World) {
        this.cli = cli;
        this.cwd = world.cwd;
        this.cloudStorage = world.cloudStorage;

        const context = this;
        this.commands = [
            {
                name: 'deploy',
                args: ['hostname'],
                description: 'Deploy Einstein service to <hostname>',
                command: context.deployCommand
            },
            {
                name: 'benchmark',
                args: ['manifest'],
                description: 'Upload benchmark specified in <manifest>',
                command: context.benchmarkCommand
            },
            {
                name: 'suite',
                args: ['manifest'],
                description: 'Upload suite specified in <manifest>',
                command: context.suiteCommand
            },
            {
                name: 'candidate',
                args: ['manifest'],
                description: 'Upload candidate specified in <manifest>',
                command: context.candidateCommand
            },
            {
                name: 'run',
                args: ['candidateId', 'suiteId'],
                description: 'Run specified suite <suiteId> on candidate <candidateId>',
                command: context.runCommand
            },
            {
                name: 'list',
                args: ['benchmarks|candidates|runs|suites'],
                description: 'List benchmarks, candidates, runs, or suites',
                command: context.listCommand
            },
            {
                name: 'help',
                args: [],
                description: 'Print help message',
                command: context.helpCommand
            },
            {
                name: 'encrypt',
                args: ['filename'],
                description: 'Encrypt secrets in <filename> using Einstein service public key',
                command: context.encryptCommand
            },
        ];
    }

    async deployCommand(args: string[]): Promise<number> {
        const [hostname] = args;
        console.log(`Deploying to ${hostname}.`)
        await this.cli.deploy(hostname);
        return 0;
    }

    async encryptCommand(args: string[]): Promise<number> {
        const [filename] = args;
        const p = fullPath(this.cwd, filename);
        await this.cli.encrypt(p);
        return 0;
    }

    async benchmarkCommand(args: string[]): Promise<number> {
        const [manifest] = args;
        const normalized = fullPath(this.cwd, manifest);
        await this.cli.uploadBenchmark(normalized);
        return 0;
    }

    async suiteCommand(args: string[]): Promise<number> {
        const [manifest] = args;
        const normalized = fullPath(this.cwd, manifest);
        await this.cli.uploadSuite(normalized);
        return 0;
    }

    async candidateCommand(args: string[]): Promise<number> {
        const [manifest] = args;
        const normalized = fullPath(this.cwd, manifest);
        await this.cli.uploadCandidate(normalized);
        return 0;
    }

    async runCommand(args: string[]): Promise<number> {
        const [candidateId, suiteId] = args;
        await this.cli.run(candidateId, suiteId);
        return 0;
    }

    async listCommand(args: string[]): Promise<number> {
        const [collection] = args;
        await listCommandInternal(this.cloudStorage, collection);
        return 0;
    }

    async helpCommand(args: string[]): Promise<number> {
        console.log('Here are some einstein commands:');
        console.log();
        for (const command of this.commands) {
            console.log(`einstein ${command.name} ${formatArgs(command.args)}`);
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
                        console.log(`  einstein ${command.name} ${formatArgs(command.args)}`);
                        return 1;
                    }
                }
            }
            console.log(`einstein: unknown command '${cmdText}'`);
            return 1;
        }
    }

    usage() {
        console.log('TODO: show einstein command usage');
    }
}

function formatArgs(args: string[]) {
    return args.map(x => `<${x}>`).join(' ');
}

function fullPath(cwd: string, relative: string) {
    return path.posix.join(cwd, relative);
}
