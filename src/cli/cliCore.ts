import * as yaml from 'js-yaml';
import * as uuid from 'uuid';

import {
    Environment,
    IOrchestrator,
    IStorage,
    RamDisk,
    Volume,
    World,
    ConsoleLogger,
    BlobLogger
} from '../cloud';

import { Laboratory, ILaboratory, SuiteDescription } from '../laboratory';
import { encodeBenchmark, encodeCandidate, encodeSuite, encodeLog } from '../naming';
import { encryptSecrets, generateKeys } from '../secrets';
import { worker } from 'cluster';

export class CLI {
    private orchestrator: IOrchestrator;
    private cloudStorage: IStorage;
    private localStorage: IStorage;

    private hostName: string | undefined;
    private lab: ILaboratory | undefined;

    constructor(world: World) {
        this.orchestrator = world.orchestrator;
        this.cloudStorage = world.cloudStorage;
        this.localStorage = world.localStorage;
    }

    async deploy(
        hostname: string
    ): Promise<void> {
        console.log(`depoying einstein to ${hostname}`);

        // TODO: generate keys here and store in CLI local store
        // and in worker's attached volume.
        // Two scenarios:
        //   1. Standing up a new server with new keys
        //   2. Restarting a server with existing keys
        const keys = generateKeys();
        const yamlText = yaml.safeDump(keys);
        const secrets = new RamDisk();
        secrets.writeBlob('keys', Buffer.from(yamlText, 'utf8'));
        const volume: Volume = {
            mount: 'secrets',
            storage: secrets
        };

        const environment = new Environment();

        // Create worker
        await this.orchestrator.createWorker(
            hostname,
            Laboratory.image.tag,
            this.cloudStorage,
            [volume],
            environment,
            new BlobLogger(this.cloudStorage, hostname, encodeLog(hostname))
        );

        // TODO: this should be set through the connect mechanism
        // that inspects a configuration file.
        this.hostName = hostname;
    }

    async getLab(): Promise<ILaboratory> {
        if (!this.hostName) {
            const message = 'Not connected to a Labratory';
            throw TypeError(message);
        }
        if (!this.lab) {
            // TODO: better handling of connection timeout exception here.
            // TODO: don't hard-code port.
            this.lab = await this.orchestrator.connect<ILaboratory>(this.hostName, 8080);
        }
        return this.lab;
    }

    async encrypt(filename: string): Promise<void> {
        const lab = await this.getLab();
        const publicKey = await lab.getPublicKey();

        const yamlText =
            (await this.localStorage.readBlob(filename)).toString('utf8');
        const data = yaml.safeLoad(yamlText);
        encryptSecrets(data, publicKey);
        const yamlText2 = yaml.safeDump(data);
        const buffer = Buffer.from(yamlText2, 'utf8');

        await this.localStorage.writeBlob(filename, buffer);
    }

    async uploadBenchmark(filename: string): Promise<void> {
        // TODO: use ILaboratory instead of uploading directly.
        const encoded = encodeBenchmark(filename);
        const buffer = await this.localStorage.readBlob(filename);
        await this.cloudStorage.writeBlob(encoded, buffer);
        console.log(`Uploaded to ${encoded}`);
    }

    // TODO: list with wildcards - what is the syntax?

    async uploadCandidate(filename: string): Promise<void> {
        // TODO: use ILaboratory instead of uploading directly.
        const encoded = encodeCandidate(filename);
        const buffer = await this.localStorage.readBlob(filename);
        await this.cloudStorage.writeBlob(encoded, buffer);
        console.log(`Uploaded to ${encoded}`);
    }

    async uploadSuite(filename: string): Promise<void> {
        // TODO: use ILaboratory instead of uploading directly.
        const buffer = await this.localStorage.readBlob(filename);
        const yamlText = buffer.toString('utf8');
        const data = yaml.safeLoad(yamlText) as SuiteDescription;

        const encoded = encodeSuite(data.name);
        await this.cloudStorage.writeBlob(encoded, buffer);
        console.log(`Uploaded to ${encoded}`);
    }

    async run(candidateId: string, suiteId: string): Promise<void> {
        // TODO: use ILaboratory instead of manipulating orchestrator directly.

        // Load the suite manifest from cloud storage in order to get the
        // benchmarkId.
        const encoded = encodeSuite(suiteId);
        console.log(`Reading suite ${suiteId} from ${encoded}`);
        const buffer = await this.cloudStorage.readBlob(encoded);
        const yamlText = buffer.toString('utf8');
        const suiteData = yaml.safeLoad(yamlText) as SuiteDescription;

        // TODO: verify the candidate's benchmarkId

        // Start the candidate container.
        const candidateHost = uuid();
        console.log(`Starting candidate ${candidateId} on ${candidateHost}`);
        this.orchestrator.createWorker(
            candidateHost,
            candidateId,
            this.cloudStorage,
            [],
            new Environment(),
            new BlobLogger(this.cloudStorage, candidateHost, encodeLog(candidateHost))
        );

        // Start the benchmark container.
        const benchmarkHost = uuid();
        console.log(`Starting benchmark ${suiteData.benchmarkId} on ${benchmarkHost}`);
        this.orchestrator.createWorker(
            benchmarkHost,
            suiteData.benchmarkId,
            this.cloudStorage,
            [],
            new Environment([
                ['host', candidateHost],
                ['suite', suiteId],
            ]),
            new BlobLogger(this.cloudStorage, benchmarkHost, encodeLog(benchmarkHost))
        );
    }

    // async connect(hostname: string) {
    //     // Read hostname from connection file.
    //     this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    // }
}
