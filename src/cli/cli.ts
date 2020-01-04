import { IOrchestrator, IStorage, IWorker } from '../cloud';
import { Laboratory, ILaboratory } from '../laboratory';
import { generateKeys } from '../secrets';
import { sleep } from '../utilities';

export class CLI {
    private orchestrator: IOrchestrator;
    private cloudStorage: IStorage;
    private localStorage: IStorage;

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
        // Push container image
        const serverImage = {
            // TODO: change tag to image or some other more appropriate name.
            tag: 'server',
            create: () => labratoryEntryPoint
        };
        this.orchestrator.pushImage(serverImage);

        // TODO: generate keys here and store in CLI local store
        // and in worker's attached volume.
        // Two scenarios:
        //   1. Standing up a new server with new keys
        //   2. Restarting a server with existing keys

        // Create worker
        await this.orchestrator.createWorker(
            hostname,
            'server',
            this.cloudStorage,
            []
        );

        this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    }

    async uploadBenchmark(filename: string): Promise<void> {
        // TODO: Implement
    }

    // TODO: list with wildcards - what is the syntax?

    async uploadCandidate(filename: string): Promise<void> {
        // TODO: Implement
    }

    async uploadSuite(filename: string): Promise<void> {
        // TODO: Implement
    }

    async run(candidateId: string, suiteId: string): Promise<void> {
        // TODO: Implement
        // TODO: probably want to use wildcard matching here.
    }

    // async connect(hostname: string) {
    //     // Read hostname from connection file.
    //     this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    // }
}

async function labratoryEntryPoint(worker: IWorker) {
    console.log(`labratoryEntryPoint()`);

    // Simulate server startup time.
    console.log('labratory: sleeping');
    await sleep(100);
    console.log('labratory: awoke');

    // Construct and bind service RPC stub.
    // TODO: write keys to CLI local storage.
    const keys = generateKeys();
    const lab = new Laboratory(keys, worker.getCloudStorage());
    worker.bind(lab, 8080);
}
