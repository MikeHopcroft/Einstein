import { IWorker } from '../../../cloud';
import { sleep } from '../../../utilities';

import { ICandidate, Symbols, Benchmark } from '../benchmark';

import { parse } from './parser';

export class Candidate implements ICandidate {
    static image = {
        tag: 'true_or_false_candidate:1.0',
        create: () => Candidate.entryPoint
    };

    static async entryPoint(worker: IWorker) {
        worker.log(`Candidate.entryPoint()`);

        // Simulate server startup time.
        worker.log('candidate: initializing');
        await sleep(1000);
        worker.log('candidate: ready');

        // Write spec to log to demonstrate that secrets have been decrypted.
        const storage = worker.getWorld().localStorage;
        const spec = (await storage.readBlob('/secrets/spec.yaml')).toString('utf8');
        worker.log(spec);

        // Construct and bind service RPC stub. 
        const myService = new Candidate(worker);
        // TODO: do not bind port here.
        worker.bind(worker.getWorld(), myService, Benchmark.candidatePort());

        // TODO: auto-shutdown if no connection after a certain amount of time?
    }

    private worker: IWorker;
    private symbols = new Map<string,boolean>();
    private readyCount = 0;

    constructor(worker: IWorker) {
        this.worker = worker;
    }

    async ready(): Promise<boolean> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////

        // Simulate a delay until ready.
        this.readyCount++;
        return this.readyCount > 1;
    }

    async initialize(symbols: Symbols): Promise<void> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////

        this.worker.log('Candidate: initialize()');
        this.symbols.clear();
        for (const symbol of symbols) {
            this.symbols.set(symbol.name, symbol.value);
        }
    }

    async runCase(input: string): Promise<boolean | string> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////

        try {
            const evaluator = parse(input);
            const result = evaluator(this.symbols);
            this.worker.log(`Case: "${input}" returns ${result}`);
            return result;
        } catch (e) {
            if (e instanceof Error) {
                this.worker.log(`Case: "${input}" returns "${e.message}"`);
                return e.message;
            } else {
                const message = "UNKNOWN EXCEPTION";
                this.worker.log(`Case: "${input}" returns "${message}"`);
                return message;
            }
        }
    }

    async shutdown(): Promise<void> {
        ///////////////////////////////////////////////////////////////////////
        //
        // Customize candidate here
        //
        ///////////////////////////////////////////////////////////////////////

        // Simulate delay in shutting down
        this.worker.log('Candidate: preparing to shutdown');
        await sleep(10000);

        this.worker.log('Candidate: shutdown()');
        this.worker.shutdown();
    }
}
