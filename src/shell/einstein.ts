import { CLI } from '../cli';

import { Shell } from './shell';

interface CommandDescription {
    name: string,
    args: string[],
    description: string,
    command: (cli: CLI, args: string[]) => Promise<number>
}

const commands: CommandDescription[] = [
    {
        name: 'deploy',
        args: ['hostname'],
        description: 'Deploy Einstein service to <hostname>',
        command: deployCommand
    },
    {
        name: 'benchmark',
        args: ['manifest'],
        description: 'Upload benchmark specified in <manifest>',
        command: benchmarkCommand
    },
    {
        name: 'suite',
        args: ['manifest'],
        description: 'Upload suite specified in <manifest>',
        command: suiteCommand
    },
    {
        name: 'candidate',
        args: ['manifest'],
        description: 'Upload candidate specified in <manifest>',
        command: candidateCommand
    },
    {
        name: 'run',
        args: ['candidateId', 'suiteId'],
        description: 'Run specified suite <suiteId> on candidate <candidateId>',
        command: runCommand
    },
    {
        name: 'help',
        args: [],
        description: 'Print help message',
        command: helpCommand
    },
    {
        name: 'encrypt',
        args: ['filename'],
        description: 'Encrypt secrets in <filename> using Einstein service public key',
        command: encryptCommand
    },
]

function formatArgs(args: string[]) {
    return args.map(x => `<${x}>`).join(' ');
}

async function deployCommand(cli: CLI, args: string[]): Promise<number> {
    const [hostname] = args;
    console.log(`Deploying to ${hostname}.`)
    await cli.deploy(hostname);
    return 0;
}

async function benchmarkCommand(cli: CLI, args: string[]): Promise<number> {
    const [manifest] = args;
    console.log(`uploading benchmark ${manifest}`);
    return 0;
}

async function suiteCommand(cli: CLI, args: string[]): Promise<number> {
    const [manifest] = args;
    console.log(`uploading suite ${manifest}`);
    return 0;
}

async function candidateCommand(cli: CLI, args: string[]): Promise<number> {
    const [manifest] = args;
    console.log(`uploading candidate ${manifest}`);
    return 0;
}

async function runCommand(cli: CLI, args: string[]): Promise<number> {
    const [candidateId, suiteId] = args;
    console.log(`running suite ${suiteId} on candidate ${candidateId}`);
    return 0;
}

async function helpCommand(cli: CLI, args: string[]): Promise<number> {
    console.log('Here are some einstein commands:');
    console.log();
    for (const command of commands) {
        console.log(`einstein ${command.name} ${formatArgs(command.args)}`);
        console.log(`  ${command.description}`);
        console.log();
    }
    return 0;
}

async function encryptCommand(cli: CLI, args: string[]): Promise<number> {
    const [filename] = args;
    console.log(`encrypting ${filename}`);
    await cli.encrypt(filename);
    return 0;
}

export async function einsteinCommand(args: string[], shell: Shell): Promise<number> {
    if (args.length < 2) {
        usage();
        return 0;
    } else {
        const cli = shell.getCLI();
        const cmdText = args[1];
        for (const command of commands) {
            if (cmdText === command.name) {
                const cmdArgs = args.slice(2);
                if (cmdArgs.length === command.args.length) {
                    try {
                        return await command.command(cli, cmdArgs);
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
        console.log(`einstein: unknown command ${cmdText}`);
        return 1;
    }
}

    // if (args.length >= 2) {
    //     const command = args[1];
    //     switch (command) {
    //         case 'deploy':
    //             break;
    //         case 'encrypt':
    //             break;
    //         case 'benchmark':
    //             break;
    //         case 'candidate':
    //             break;
    //         default:
    //             console.log(`einstein: unknown command ${command}`);
    //     }
    // } else {
    //     usage();
    // }

//     if (args.length === 3 && args[1]==='deploy') {
//         const hostname = args[2];
//         const cli = shell.getCLI();
//         console.log(`Deploying to ${hostname}.`)
//         cli.deploy(hostname);
//     } else if (args.length === 3 && args[1]==='encrypt') {
//         const filename = args[3];
//         const cli = shell.getCLI();
//         await cli.encrypt('filename');
//     } else {
//         console.log(`einstein: invalid command`);
//     }
//     return 0;
// }

function usage() {
    console.log('TODO: show einstein command usage');
}
