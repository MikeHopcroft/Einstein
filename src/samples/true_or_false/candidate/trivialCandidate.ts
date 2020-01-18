import { IWorker } from '../../../cloud';
import { sleep } from '../../../utilities';

import { ICandidate, Symbols } from '../benchmark';

export class TrivialCandidate implements ICandidate {
    static imageFalse = {
        // tag: 'myregistry.azurecr.io/true_or_false_candidate:1.0',
        tag: 'alwaysFalse_candidate:1.0',
        create: () => TrivialCandidate.entryPointFalse
    };

    static imageTrue = {
        // tag: 'myregistry.azurecr.io/true_or_false_candidate:1.0',
        tag: 'alwaysTrue_candidate:1.0',
        create: () => TrivialCandidate.entryPointTrue
    };

    static async entryPointFalse(worker: IWorker) {
        TrivialCandidate.entryPoint(worker, false);
    }

    static async entryPointTrue(worker: IWorker) {
        TrivialCandidate.entryPoint(worker, true);
    }

    static async entryPoint(worker: IWorker, truthValue: boolean) {
        worker.log(`TrivialCandidate.entryPoint()`);

        // Simulate server startup time.
        worker.log('TrivialCandidate: initializing');
        await sleep(1000);
        worker.log('TrivialCandidate: ready');
    
        // Construct and bind service RPC stub. 
        const myService = new TrivialCandidate(worker, truthValue);
        // TODO: do not bind port here.
        worker.bind(worker.getWorld(), myService, 8080);

        // TODO: auto-shutdown if no connection after a certain amount of time?
    }

    private worker: IWorker;
    private truthValue: boolean;

    private readyCount = 0;
    
    constructor(worker: IWorker, truthValue: boolean) {
        this.worker = worker;
        this.truthValue = truthValue;
    }

    async ready(): Promise<boolean> {
        // Simulate a delay until ready.
        this.readyCount++;
        return this.readyCount > 1;
    }

    async initialize(symbols: Symbols): Promise<void> {
        this.worker.log('TrivialCandidate: initialize()');
        // Ignore symbols.
    }

    async runCase(input: string): Promise<boolean | string> {
        return this.truthValue;
    }

    async shutdown(): Promise<void> {
        // Simulate delay in shutting down
        this.worker.log('TrivialCandidate: preparing to shutdown');
        await sleep(5000);

        this.worker.log('TrivialCandidate: shutdown()');
        this.worker.shutdown();
        // process.exit(0);
    }
}
