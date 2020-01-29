import * as yaml from 'js-yaml';

import { IStorage, IWorker } from '../../../cloud';
import { Kind, RunDescription, loadSuite } from '../../../laboratory';
import { encodeRun } from '../../../naming';
import { sleep } from '../../../utilities';

import { ICandidate } from './interfaces';
import { validateTestSuite } from './schemas';

export class Benchmark {
    // TODO: don't hard-code hostname and port here.
    // The candidate's service port.
    static candidatePort() {
        return 8080;
    }

    static image = {
        // tag: 'myregistry.azurecr.io/true_or_false_benchmark:1.0',
        tag: 'true_or_false_benchmark:1.0',
        create: () => Benchmark.entryPoint
    };

    static async entryPoint(worker: IWorker) {
        worker.log(`Benchmark.entryPoint()`);
        const env =  worker.getWorld().environment;
        const candidateId = env.get('candidate');
        const candidateHost = env.get('host');
        const runId = env.get('run');
        const suiteId = env.get('suite');
        // TODO: check for undefined candidateHost, candidateId, suiteName
        worker.log(`Candidate host is ${candidateHost}`);
        worker.log(`Candidate is ${candidateId}`);
        worker.log(`Suite is ${suiteId}`);

        // Simulate startup time.
        worker.log('benchmark: sleeping');
        await sleep(1000);
        worker.log('benchmark: awoke');

        // TODO: pass worker to constructor?
        const benchmark = new Benchmark(worker);

        const candidate =
            (await worker.connect<ICandidate>(candidateHost, Benchmark.candidatePort())) as ICandidate;

        await benchmark.run(candidate, candidateId, runId, suiteId);
    }

    private worker: IWorker;
    private cloudStorage: IStorage;

    // Maximum number of attempts to contact the Candidate.
    private maxConnectionAttempts = 5;

    // Number of milliseconds between attempts to contact the Candidate.
    private msBetweenConnectionAttempts = 1000;


    constructor(worker: IWorker) {
        this.worker = worker;
        this.cloudStorage = worker.getWorld().cloudStorage;
    }

    async run(
        candidate: ICandidate,
        candidateId: string,
        runId: string,
        suiteId: string
    ) {
        this.worker.log('Benchmark: run()');

        // Load suite from cloud storage.
        const suite = await loadSuite(suiteId, this.cloudStorage);

        // Validate TestSuite schema
        const testSuite = validateTestSuite(suite.data);

        // Wait until candidate is ready.
        const ready = await this.waitForCandidate(candidate);

        if (!ready) {
            // Candidate did not start up.
            // Log failure.
            this.worker.log('Candidate did not start up.');
        } else {
            // Initialize the candidate.
            await candidate.initialize(testSuite.domainData);

            // Run each test case.
            let passed = 0;
            let failed = 0;
            for (const testCase of testSuite.testCases) {
                const result = await candidate.runCase(testCase.input);
                const success = (result === testCase.expected);
                if (success) {
                    ++passed;
                    this.worker.log(`passed: "${testCase.input}"`)
                } else {
                    ++failed;
                    this.worker.log(`failed: "${testCase.input}" ==> "${result}"`);
                }
            }

            // Shutdown the candidate.
            await candidate.shutdown();

            // Compute measures
            const data = { passed, failed };

            // Write results
            this.worker.log('Benchmark: writing results');

            // TODO: use naming service for benchmarkId.
            const benchmarkId = Benchmark.image.tag;
            const name = runId;
            const description = 'foo';
            const owner = 'foo';
            const created = new Date().toISOString();
            const rd: RunDescription = {
                kind: Kind.RUN,
                apiVersion: '0.0.1',
                runId,
                candidateId,
                suiteId,
                benchmarkId,
                name,
                description,
                owner,
                created,
                data
            };
            const text = yaml.safeDump(rd);
            const buffer = Buffer.from(text, 'utf8');
            await this.cloudStorage.writeBlob(
                encodeRun(runId),
                buffer,
                false
            );
            this.worker.log('Benchmark finished');
        }

        return;
    }

    async waitForCandidate(candidate: ICandidate): Promise<boolean> {
        let ready = false;
        for (let i = 0; i < this.maxConnectionAttempts; ++i) {
            this.worker.log('Benchmark: is candidate ready?');
            ready = await candidate.ready();
            if (ready) {
                this.worker.log('Benchmark: candidate is ready');
                break;
            }
            this.worker.log('Benchmark: sleeping ...');
            await sleep(this.msBetweenConnectionAttempts);
        }
        return ready;
    }
}
