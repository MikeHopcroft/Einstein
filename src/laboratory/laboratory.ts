import * as yaml from 'js-yaml';
// import { v3 } from 'murmurhash';
// import * as uuid from 'uuid';

import { IStorage, IWorker, RamDisk } from '../cloud';
import { generateKeys, KeyPair } from '../secrets';
import { ContainerImage, sleep } from '../utilities';

import {
    BenchmarkDescription,
    CandidateDescription,
    ILaboratory,
    SuiteDescription,
    UID
} from './interfaces';
import { Benchmark } from '../samples/true_or_false/benchmark';

// Murmurhash seed.
const seed = 1234567;

export class Laboratory implements ILaboratory {
    static image = {
        tag: 'myregistry.azurecr.io/labratory:1.0',
        create: () => Laboratory.entryPoint
    };

    // TODO: this should do a bind, not a connect.
    static async entryPoint(worker: IWorker) {
        // console.log(`Laboratory.entryPoint()`);

        // Simulate server startup time.
        // console.log('laboratory: sleeping');
        await sleep(1000);
        // console.log('laboratory: awoke');

        // TODO: get KeyPair from local storage instead.
        const keys: KeyPair = generateKeys();

        // Construct and bind service RPC stub. 
        const myService = new Laboratory(keys, worker.getFileSystem());

        // TODO: do not hard-code port here.
        worker.bind(worker.getWorld(), myService, 8080);
    }

    private keys: KeyPair;
    private cloudStorage: IStorage;

    constructor(keys: KeyPair, cloudStorage: IStorage) {
        this.keys = keys;
        this.cloudStorage = cloudStorage;
    }

    async getPublicKey(): Promise<string> {
        return this.keys.publicKey;
    }

    async createBenchmark(description: BenchmarkDescription): Promise<UID> {
        const image = new ContainerImage(description.image);
        const tagPart = image.tag ? '/'+image.tag : '';
        const benchmarkId = `${image.component}${tagPart}`;

        // TODO: use Naming library
        const blobPath = `benchmarks/${benchmarkId}`;
        // TODO: check for attempt blob overwrite.
        console.log(`Create ${blobPath}`);
        const yamlBuffer = Buffer.from(yaml.safeDump(description), 'utf8');
        this.cloudStorage.writeBlob(blobPath, yamlBuffer);
        return benchmarkId;
    }

    async listBenchmarks(pattern: CandidateDescription): Promise<BenchmarkDescription[]> {
        // TODO: implement wildcard matching
        return [];
    }

    async createCandidate(description: CandidateDescription): Promise<UID> {
        const image = new ContainerImage(description.image);
        const tagPart = image.tag ? '/'+image.tag : '';
        const candidateId = `${image.component}${tagPart}`;

        // TODO: use Naming library
        const blobPath = `candidates/${candidateId}`;

        // TODO: check for attempt blob overwrite.
        console.log(`Create ${blobPath}`);
        const yamlBuffer = Buffer.from(yaml.safeDump(description), 'utf8');
        this.cloudStorage.writeBlob(blobPath, yamlBuffer);
        return candidateId;
    }

    async listCandidates(pattern: CandidateDescription): Promise<CandidateDescription[]> {
        // TODO: implement wildcard matching
        return [];
    }

    async createSuite(description: SuiteDescription): Promise<UID> {
        // TODO: organize suites by benchmarkId then suite hash?
        // TODO: use Naming library
        const blobPath = `suites/${description.benchmarkId}/${description.name}`;
        // TODO: check for attempt blob overwrite.
        console.log(`Create ${blobPath}`);
        const yamlBuffer = Buffer.from(yaml.safeDump(description), 'utf8');
        this.cloudStorage.writeBlob(blobPath, yamlBuffer);
        return blobPath;
    }

    async listSuites(pattern: SuiteDescription): Promise<BenchmarkDescription[]> {
        // TODO: implement wildcard matching
        return [];
    }

    async run(candidateId: UID, suiteId: UID): Promise<void> {
        console.log('Running:');
        console.log(`  suite: ${suiteId}`);
        console.log(`  candidate: ${candidateId}`);

        const candidate = await this.loadCandidate(candidateId);
        const suite = await this.loadSuite(suiteId);

        if (candidate.benchmarkId !== suite.benchmarkId) {
            const message = "Candidate and suite benchmarkIds don't match";
            throw TypeError(message);
        }

        console.log(`  benchmark: ${suite.benchmarkId}`);

        const benchmark = await this.loadBenchmark(suite.benchmarkId);
    }

    private async loadBenchmark(id: string): Promise<BenchmarkDescription> {
        // TODO: use Naming library
        return this.loadYaml('benchmarks/'+id);
    }

    private async loadCandidate(id: string): Promise<CandidateDescription> {
        // TODO: use Naming library
        return this.loadYaml('suites/'+id);
    }

    private async loadSuite(id: string): Promise<SuiteDescription> {
        // TODO: use Naming library
        return this.loadYaml('candidates/'+id);
    }

    private async loadYaml<T>(path: string): Promise<T> {
        const yamlText = (
            await this.cloudStorage.readBlob(path)
        ).toString('utf8');

        // TODO: verify schema.
        return yaml.safeLoad(yamlText) as T;
    }
}

async function go() {
    const keys = generateKeys();
    const cloudStorage = new RamDisk();
    const lab = new Laboratory(keys, cloudStorage);

    const benchmark: BenchmarkDescription = {
        name: 'Sample True_Or_False Benchmark',
        description: 'A sample benchmark for boolean expressions evaluation.',
        owner: 'Mike',
        created: new Date().toISOString(),
        image: 'myregistry.azurecr.io/true_or_false_benchmark:1.0'
    };
    const benchmarkId = await lab.createBenchmark(benchmark);

    const suite: SuiteDescription = {
        name: 'Sample True_Or_False Suite',
        description: 'A sample benchmark for boolean expressions evaluation.',
        owner: 'Mike',
        created: new Date().toISOString(),
        benchmarkId,
        domainData: [],
        testData: []
    };
    const suiteId = await lab.createSuite(suite);

    const candidate: CandidateDescription = {
        name: 'Sample True_Or_False Candidate',
        description: 'A sample candidate that implements a boolean expression parser.',
        owner: 'Mike',
        created: new Date().toISOString(),
        benchmarkId,
        image: 'myregistry.azurecr.io/true_or_false_candidate:1.0'
    };
    const candidateId = await lab.createCandidate(candidate);

    lab.run(candidateId, suiteId);
}

// go();

