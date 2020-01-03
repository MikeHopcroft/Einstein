import { ICandidate, SymbolTable } from '../benchmark';

import { parse } from './parser';

export class Candidate implements ICandidate {
    symbols = new Map<string,boolean>();
    readyCount = 0;

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
