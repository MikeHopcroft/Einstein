import * as yaml from 'js-yaml';
import { v3 } from 'murmurhash';
import * as uuid from 'uuid';

import { IStorage, RamDisk } from '../cloud';
import { generateKeys, KeyPair } from '../secrets';
import { ContainerImage } from '../utilities';

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
        // const uid = uuid();
        const image = new ContainerImage(description.image);
        // const containerHash = v3(description.containerBaseName, seed);
        // const versionHash = v3(description.containerVersion, seed);
        // const componentHash = v3(image.component, seed);
        // const tagHash = v3(image.tag, seed);
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
        // const uid = uuid();
        // const containerHash = v3(description.containerBaseName, seed);
        // const versionHash = v3(
        //     `${description.benchmarkId}:${description.containerVersion}`,
        //     seed
        // );
        // const blobPath = `candidates/${containerHash}/${versionHash}`;
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
        // const hash = v3(description.benchmarkId, seed);

        // TODO: organize suites by benchmarkId then suite hash?
        // const blobPath = `suites/${hash}`;

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

    // private async loadCandidate(candidateId: string): Promise<CandidateDescription> {
    //     const suiteYaml = (
    //         await this.cloudStorage.readBlob(candidateId)
    //     ).toString('utf8');

    //     // TODO: verify schema.
    //     const suite = yaml.safeLoad(suiteYaml) as SuiteDescription;
    //     return suite;
    // }
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

    // private async loadSuite(suiteId: string): Promise<SuiteDescription> {
    //     const suiteYaml = (
    //         await this.cloudStorage.readBlob(suiteId)
    //     ).toString('utf8');

    //     // TODO: verify schema.
    //     const suite = yaml.safeLoad(suiteYaml) as SuiteDescription;
    //     return suite;
    // }
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
        // containerBaseName: 'true_or_false_benchmark',
        // containerVersion: '1.0'
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
        // containerBaseName: 'true_or_false_candidate',
        // containerVersion: '1.0'
    };
    const candidateId = await lab.createCandidate(candidate);

    lab.run(candidateId, suiteId);
}

// go();

