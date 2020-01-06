import { IWorker } from '../../../cloud';
import { sleep } from '../../../utilities';

import { ICandidate, SymbolTable } from '../benchmark';

import { parse } from './parser';

export class Candidate implements ICandidate {
    static image = {
        tag: 'myregistry.azurecr.io/true_or_false_candidate:1.0',
        create: () => Candidate.entryPoint
    };

    static async entryPoint(worker: IWorker) {
        console.log(`Candidate.entryPoint()`);

        // Simulate server startup time.
        console.log('candidate: sleeping');
        await sleep(1000);
        console.log('candidate: awoke');
    
        // Construct and bind service RPC stub. 
        const myService = new Candidate();
        // TODO: do not bind port here.
        worker.bind(myService, 8080);

        // TODO: auto-shutdown if no connection after a certain amount of time?
    }

    private symbols = new Map<string,boolean>();
    private readyCount = 0;

    async ready(): Promise<boolean> {
        // Simulate a delay until ready.
        this.readyCount++;
        return this.readyCount > 1;
    }

    async initialize(symbols: SymbolTable): Promise<void> {
        console.log('Candidate: initialize()');
        this.symbols.clear();
        for (const symbol of symbols) {
            this.symbols.set(symbol.name, symbol.value);
        }
    }

    async runCase(input: string): Promise<boolean | string> {
        try {
            const evaluator = parse(input);
            return evaluator(this.symbols);
        } catch (e) {
            if (e instanceof Error) {
                return e.message;
            } else {
                return "UNKNOWN EXCEPTION";
            }
        }
    }

    async shutdown(): Promise<void> {
        console.log('Candidate: shutdown()');
        // process.exit(0);
    }
}
