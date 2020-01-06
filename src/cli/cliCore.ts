import * as yaml from 'js-yaml';

import { IOrchestrator, IStorage, IWorker, RamDisk, Volume } from '../cloud';
import { Laboratory, ILaboratory } from '../laboratory';
import { generateKeys } from '../secrets';
import { sleep } from '../utilities';

export class CLI {
    private orchestrator: IOrchestrator;
    private cloudStorage: IStorage;
    private localStorage: IStorage;

    private hostName: string | undefined;
    private lab: ILaboratory | undefined;

    constructor(
        orchestrator: IOrchestrator,
        cloudStorage: IStorage,
        localStorage: IStorage
    ) {
        this.orchestrator = orchestrator;
        this.cloudStorage = cloudStorage;
        this.localStorage = localStorage;
    }

    async deploy(
        hostname: string
    ): Promise<void> {
        console.log('depoying');
        // const labratoryTag = 'labratory:1.0';
        const labratoryTag = Laboratory.image.tag;

        // TODO: Container shouldn't be pushed here.
        // It should already be in the environment.
        // Push container image
        // const serverImage = {
        //     // TODO: change tag to image or some other more appropriate name.
        //     tag: labratoryTag,
        //     create: () => labratoryEntryPoint
        // };
        // this.orchestrator.pushImage(serverImage);

        // TODO: generate keys here and store in CLI local store
        // and in worker's attached volume.
        // Two scenarios:
        //   1. Standing up a new server with new keys
        //   2. Restarting a server with existing keys
        const keys = generateKeys();
        const yamlText = yaml.safeDump(keys);
        const secrets = new RamDisk();
        secrets.writeBlob('keys', Buffer.from(yamlText, 'utf8'));
        const volume: Volume = {
            mount: 'secrets',
            storage: secrets
        };

        // Create worker
        await this.orchestrator.createWorker(
            hostname,
            labratoryTag,
            this.cloudStorage,
            [volume]
        );

        // TODO: this should be set through the connect mechanism
        // that inspects a configuration file.
        this.hostName = hostname;
    }

    async getLab(): Promise<ILaboratory> {
        if (!this.hostName) {
            const message = 'Not connected to a Labratory';
            throw TypeError(message);
        }
        if (!this.lab) {
            // TODO: better handling of connection timeout exception here.
            // TODO: don't hard-code port.
            this.lab = await this.orchestrator.connect<ILaboratory>(this.hostName, 8080);
        }
        return this.lab;
    }

    async encrypt(filename: string): Promise<void> {
        const lab = await this.getLab();
        const publicKey = await lab.getPublicKey();
        console.log(publicKey);
    }

    async uploadBenchmark(filename: string): Promise<void> {
        // TODO: implement
    }

    // TODO: list with wildcards - what is the syntax?

    async uploadCandidate(filename: string): Promise<void> {
        // TODO: implement
    }

    async uploadSuite(filename: string): Promise<void> {
        // TODO: implement
    }

    async run(candidateId: string, suiteId: string): Promise<void> {
        // TODO: implement
        // TODO: probably want to use wildcard matching here.
    }

    // async connect(hostname: string) {
    //     // Read hostname from connection file.
    //     this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    // }
}

async function labratoryEntryPoint(worker: IWorker) {
    // console.log(`labratoryEntryPoint()`);

    // Simulate server startup time.
    // console.log('labratory: sleeping');
    await sleep(5000);
    // console.log('labratory: awoke');

    // Construct and bind service RPC stub.
    // TODO: write keys to CLI local storage.
    const keys = generateKeys();
    const lab = new Laboratory(keys, worker.getCloudStorage());
    worker.bind(lab, 8080);
}
