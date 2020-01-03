import * as yaml from 'js-yaml';

import { IStorage } from '../../../cloud';
import { sleep } from '../../../utilities';

import { ICandidate, SymbolTable, TestSuite } from './interfaces';

export class Benchmark {
    private cloudStorage: IStorage;
    private localStorage: IStorage;

    constructor(cloudStorage: IStorage, localStorage: IStorage) {
        this.cloudStorage = cloudStorage;
        this.localStorage = localStorage;
    }

    async run(candidate: ICandidate) {
        console.log('Benchmark: run()');

        // TODO: error handling for async APIs

        // Get private key from secrets.txt
        const secrets =
            (await this.localStorage.readBlob('secrets.txt')).toString('utf-8');
        console.log(`Benchmark: secrets = "${secrets}"`);

        // Load test suite from cloud storage.
        const suite = yaml.safeLoad(
            (await this.cloudStorage.readBlob('suite')).toString('utf-8')
        ) as TestSuite;
        // TODO: Verify TestSuite schema

        // Load experiment symbol table from cloud storage.
        const symbols = yaml.safeLoad(
            (await this.cloudStorage.readBlob('domainData')).toString('utf-8')
        ) as SymbolTable;
        // TODO: Verify SymbolTable schema

        // Wait until candidate is ready.
        const ready = await waitForCandidate(candidate);

        if (!ready) {
            // Candidate did not start up.
            // Log failure.
            console.log('Candidate did not start up.');
        } else {
            // Initialize the candidate.
            await candidate.initialize(symbols);

            // Run each test case.
            for (const testCase of suite.cases) {
                const result = await candidate.runCase(testCase.input);
                const success = (result === testCase.expected);
                if (success) {
                    console.log(`passed: "${testCase.input}"`)
                } else {
                    console.log(`failed: "${testCase.input}" ==> "${result}"`)
                }
            }

            // Shutdown the candidate.
            await candidate.shutdown();

            // Compute measures

            // Write results
            console.log('Benchmark: writing results');
            this.cloudStorage.writeBlob(
                'results',
                Buffer.from('benchmark results', 'utf-8')
            );
        }

        console.log('Benchmark: return');
        return;
    }
}

// TODO: better way to configure timeout.
const maxTries = 5;
async function waitForCandidate(candidate: ICandidate): Promise<boolean> {
    let ready = false;
    for (let i = 0; i < maxTries; ++i) {
        console.log('Benchmark: ready?');
        ready = await candidate.ready();
        if (ready) {
            break;
        }
        console.log('Benchmark: sleeping ...');
        await sleep(1000);
    }
    return ready;
}
