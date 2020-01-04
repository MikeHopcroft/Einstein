import { IOrchestrator, IStorage, IWorker } from '../cloud';
import { Laboratory, ILaboratory } from '../laboratory';
import { generateKeys } from '../secrets';
import { sleep } from '../utilities';

export class CLI {
    orchestrator: IOrchestrator;
    cloudStorage: IStorage;
    localStorage: IStorage;

    lab: ILaboratory | undefined;

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
        // TODO: implement.

        // Push container image
        const serverImage = {
            tag: 'server',
            create: () => serverEntryPoint
        };
        this.orchestrator.pushImage(serverImage);

        // Create worker
        await this.orchestrator.createWorker(
            hostname,
            'server',
            this.cloudStorage,
            []
        );

        this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    }

    // async connect(hostname: string) {
    //     // Read hostname from connection file.
    //     this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    // }
}

async function serverEntryPoint(worker: IWorker) {
    console.log(`serverEntryPoint()`);

    // Simulate server startup time.
    console.log('labratory: sleeping');
    await sleep(100);
    console.log('labratory: awoke');

    // Construct and bind service RPC stub.
    const keys = generateKeys();
    const lab = new Laboratory(keys, worker.getCloudStorage());
    worker.bind(lab, 8080);
}
