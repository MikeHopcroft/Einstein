import * as path from 'path';

import { World, IStorage } from '../cloud';
import { formatSelectResults } from '../utilities';

import { CLI } from './cliCore';

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
                name: 'create',
                args: ['spec'],
                description: 'Create benchmark, candidate or suite specified in <spec>',
                command: context.createCommand
            },
            {
                name: 'run',
                args: ['candidateId', 'suiteId'],
                description: 'Run specified suite <suiteId> on candidate <candidateId>',
                command: context.runCommand
            },
            {
                name: 'results',
                args: ['benchmarkId'],
                description: 'Print test run results for <benchmarkId>',
                command: context.resultsCommand
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

    private usage() {
        console.log(`Expected a sub-command:`);
        for (const command of this.commands) {
            console.log(`  ${command.name} ${formatArgs(command.args)}`);
        }
        console.log('Type "einstein help" for more information.');
    }

    private async deployCommand(args: string[]): Promise<number> {
        const [filename] = args;
        const p = fullPath(this.cwd, filename);
        console.log(`Deploying from ${p}.`)
        await this.cli.deploy(p);
        return 0;
    }

    private async encryptCommand(args: string[]): Promise<number> {
        const [filename] = args;
        const p = fullPath(this.cwd, filename);
        await this.cli.encrypt(p);
        return 0;
    }

    private async createCommand(args: string[]): Promise<number> {
        const [manifest] = args;
        const normalized = fullPath(this.cwd, manifest);
        await this.cli.create(normalized);
        return 0;
    }

    private async listCommand(args: string[]): Promise<number> {
        const [container] = args;
        const results = await this.cli.list(container);
        for (const line of formatSelectResults(results)) {
            console.log(line);
        }
        return 0;
    }

    private async resultsCommand(args: string[]): Promise<number> {
        const [benchmarkId] = args;
        const results = await this.cli.results(benchmarkId);
        for (const line of formatSelectResults(results)) {
            console.log(line);
        }
        return 0;
    }

    private async runCommand(args: string[]): Promise<number> {
        const [candidateId, suiteId] = args;
        await this.cli.run(candidateId, suiteId);
        return 0;
    }

    private async helpCommand(args: string[]): Promise<number> {
        console.log('Here are some einstein commands:');
        console.log();
        for (const command of this.commands) {
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

function fullPath(cwd: string, relative: string) {
    return path.posix.join(cwd, relative);
}
