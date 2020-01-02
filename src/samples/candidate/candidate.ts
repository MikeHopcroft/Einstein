// import * as yaml from 'js-yaml';
// import * as fs from 'fs';

import { ICandidate, SymbolTable } from '../benchmark';

import { parse } from './parser';

// export interface TestCase {
//     input: string;
//     expected: boolean | string;
// }

// export interface TestSuite {
//     name: string;
//     description: string;
//     benchmark: string;
//     domainData: string;
//     cases: TestCase[];
// }

// export type DomainData = Variable[];

// export interface Variable {
//     name: string;
//     value: boolean;
// }

export class Candidate implements ICandidate {
    symbols = new Map<string,boolean>();
    readyCount = 0;

    async ready(): Promise<boolean> {
        this.readyCount++;
        return this.readyCount > 1;
    }

    async initialize(symbols: SymbolTable): Promise<void> {
        console.log('Candidate: initialize()');
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

// function process(symbols: Map<string, boolean>, text: string): boolean | string {
//     try {
//         const evaluator = parse(text);
//         return evaluator(symbols);
//     } catch (e) {
//         if (e instanceof Error) {
//             return e.message;
//         } else {
//             return "UNKNOWN EXCEPTION";
//         }
//     }
// }

// function go(domainDataFile: string, suiteFile: string) {
//     const data =
//         yaml.safeLoad(fs.readFileSync(domainDataFile, 'utf8')) as SymbolTable;
//     // const symbols =
//     //     new Map<string, boolean>(data.map(x => [x.name, x.value]));
//     const suite =
//         yaml.safeLoad(fs.readFileSync(suiteFile, 'utf8')) as TestSuite;

//     const candidate = new Candidate();
//     candidate.initialize(data);

//     for (const testCase of suite.cases) {
// //        const result = process(symbols, testCase.input);
//         const result = candidate.testCase(testCase.input);
//         const success = (result === testCase.expected);
//         if (success) {
//             console.log(`passed: "${testCase.input}"`)
//         } else {
//             console.log(`failed: "${testCase.input}" ==> "${result}"`)
//         }
//     }
// }

// go(
//     'd:\\git\\einstein\\src\\samples\\suites\\domain.yaml',
//     'd:\\git\\einstein\\src\\samples\\suites\\simple.yaml'
// );


