import { IWorker } from '../../../cloud';

import { ICandidate, Symbols, Benchmark } from '../benchmark';

export class Candidate implements ICandidate {
    static image = {
        tag: 'true_or_false_candidate:1.0',
        create: () => Candidate.entryPoint
    };

    static async entryPoint(worker: IWorker) {
        worker.log(`Candidate.entryPoint()`);
    
        // Construct and bind service RPC stub. 
        const myService = new Candidate(worker);
        worker.bind(worker.getWorld(), myService, Benchmark.candidatePort());
    }

    private worker: IWorker;

    constructor(worker: IWorker) {
        this.worker = worker;
    }

    async ready(): Promise<boolean> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////
        this.worker.log('ready()');

        return true;
    }

    async initialize(symbols: Symbols): Promise<void> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////

        this.worker.log('initialize()');
    }

    async runCase(input: string): Promise<boolean | string> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////

        this.worker.log(`runCase(${input})`);
        return "your result here";
    }

    async shutdown(): Promise<void> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////

        this.worker.log('Candidate: shutdown()');
        this.worker.shutdown();
    }
}
