import * as yaml from 'js-yaml';

import { IStorage, IWorker, ILogger } from '../../../cloud';
import { encodeSuite, encodeRun } from '../../../naming';
import { sleep } from '../../../utilities';

import { ICandidate, SymbolTable, TestSuite } from './interfaces';
import { RunDescription } from '../../../laboratory';

export class Benchmark {
    static image = {
        // tag: 'myregistry.azurecr.io/true_or_false_benchmark:1.0',
        tag: 'true_or_false_benchmark:1.0',
        create: () => Benchmark.entryPoint
    };

    static async entryPoint(worker: IWorker) {
        worker.log(`Benchmark.entryPoint()`);
        console.log(`Benchmark.entryPoint()`);
        const env =  worker.getEnvironment();
        const candidateId = env.get('candidate');
        const candidateHost = env.get('host');
        const suiteId = env.get('suite');
        // TODO: check for undefined candidateHost, candidateId, suiteName
        console.log(`Candidate host is ${candidateHost}`);
        console.log(`Candidate is ${candidateId}`);
        console.log(`Suite is ${suiteId}`);

        // Simulate startup time.
        console.log('benchmark: sleeping');
        await sleep(1000);
        console.log('benchmark: awoke');

        // TODO: pass worker to constructor?
        const benchmark = new Benchmark(worker);

        // TODO: don't hard-code hostname and port here.
        const candidate =
            (await worker.connect<ICandidate>(candidateHost, 8080)) as ICandidate;

        await benchmark.run(candidate, candidateId, suiteId);
    }

    private worker: IWorker;
    private cloudStorage: IStorage;
    private localStorage: IStorage;

    constructor(worker: IWorker) {
        this.worker = worker;
        this.cloudStorage = worker.getCloudStorage();
        this.localStorage = worker.getFileSystem();
    }

    async run(candidate: ICandidate, candidateId: string, suiteId: string) {
        console.log('Benchmark: run()');

        // TODO: error handling for async APIs

        // // Get private key from secrets.txt
        // const secrets =
        //     (await this.localStorage.readBlob('secrets.txt')).toString('utf-8');
        // console.log(`Benchmark: secrets = "${secrets}"`);

        // Load test suite from cloud storage.
        const encoded = encodeSuite(suiteId);
        const suite = yaml.safeLoad(
            (await this.cloudStorage.readBlob(encoded)).toString('utf-8')
        ) as TestSuite;
        // TODO: Verify TestSuite schema

        // Load experiment symbol table from cloud storage.
        const symbols = suite.domainData;
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
            let passed = 0;
            let failed = 0;
            for (const testCase of suite.testCases) {
                const result = await candidate.runCase(testCase.input);
                const success = (result === testCase.expected);
                if (success) {
                    ++passed;
                    this.worker.log(`passed: "${testCase.input}"\n`)
                    console.log(`passed: "${testCase.input}"`)
                } else {
                    ++failed;
                    this.worker.log(`failed: "${testCase.input}" ==> "${result}"\n`);
                    console.log(`failed: "${testCase.input}" ==> "${result}"`);
                }
            }

            // Shutdown the candidate.
            await candidate.shutdown();

            // Compute measures

            // Write results
            console.log('Benchmark: writing results');
            const runId = this.worker.getWorld().hostname;
            const benchmarkId = Benchmark.image.tag;
            const name = 'foo';
            const description = 'foo';
            const owner = 'foo';
            const created = new Date().toISOString();
            const results = { passed, failed };
            const rd: RunDescription = {
                runId,
                candidateId,
                suiteId,
                benchmarkId,
                name,
                description,
                owner,
                created,
                results
            };
            const text = yaml.safeDump(rd);
            const buffer = Buffer.from(text, 'utf8');
            await this.cloudStorage.writeBlob(
                encodeRun(runId),
                buffer
            );
            console.log('Benchmark finished');
        }

        // // Simulate delay in shutting down
        // await sleep(10000);

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
