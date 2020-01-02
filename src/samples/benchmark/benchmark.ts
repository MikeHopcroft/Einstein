import * as yaml from 'js-yaml';
// import * as fs from 'fs';

// TODO: IStorage
// TODO: ICandidateFactory, HttpCandidate, LocalCandidate
// TODO: SuiteLoader
import { IStorage } from '../../cloud';

import { Candidate } from '../candidate';

import { ICandidate, SymbolTable, TestSuite } from './interfaces';

export class Benchmark {
    // candidate: ICandidate;
    cloudStorage: IStorage;
    localStorage: IStorage;

    constructor(cloudStorage: IStorage, localStorage: IStorage) {
        this.cloudStorage = cloudStorage;
        this.localStorage = localStorage;
    }

    async run(candidate: ICandidate) {
        console.log('Benchmark: run()');
        const secrets =
            (await this.localStorage.readBlob('secrets.txt')).toString('utf-8');
        console.log(`Benchmark: secrets = "${secrets}"`);

        const symbols = yaml.safeLoad(
            (await this.cloudStorage.readBlob('domainData')).toString('utf-8')
        ) as SymbolTable;

        const suite = yaml.safeLoad(
            (await this.cloudStorage.readBlob('suite')).toString('utf-8')
        ) as TestSuite;

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

export async function runBenchmarkxxx(
    candidate: ICandidate,
    domainData: SymbolTable,
    suite: TestSuite,
    storage: IStorage
) {
    // Wait until candidate is ready.
    const ready = await waitForCandidate(candidate);

    if (!ready) {
        // Candidate did not start up.
        // Log failure.
        console.log('Candidate did not start up.');
    } else {
        // Initialize the candidate.
        await candidate.initialize(domainData);

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
    }
}

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

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// //function go(candidateId: string, suiteId: string) {
// async function go(domainDataFile: string, suiteFile: string) {
//     const domainData =
//         yaml.safeLoad(fs.readFileSync(domainDataFile, 'utf8')) as SymbolTable;
//     // const symbols =
//     //     new Map<string, boolean>(data.map(x => [x.name, x.value]));
//     const suite =
//         yaml.safeLoad(fs.readFileSync(suiteFile, 'utf8')) as TestSuite;

//     const candidate = new Candidate();

//     const storage = null as unknown as IStorage;

//     await runBenchmark(candidate, domainData, suite, storage);
// }

// go(
//     'd:\\git\\einstein\\src\\samples\\suites\\domain.yaml',
//     'd:\\git\\einstein\\src\\samples\\suites\\simple.yaml'
// );
