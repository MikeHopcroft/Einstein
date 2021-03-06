import * as yaml from 'js-yaml';

import {
    Environment,
    IOrchestrator,
    IStorage,
    RamDisk,
    Volume,
    World,
    BlobLogger
} from '../cloud';

import { Laboratory, ILaboratory } from '../laboratory';
import { encodeLog, getCollectionTable } from '../naming';
import { encryptSecrets, generateKeys } from '../secrets';
import { loadEntity, loadLaboratory } from '../laboratory/loaders';
import { IRepository, Repository, SelectResults } from '../repository';

export class CLI {
    private orchestrator: IOrchestrator;
    private cloudStorage: IStorage;
    private localStorage: IStorage;

    private labHostname: string | undefined;
    private labPort: number | undefined;
    private lab: ILaboratory | undefined;

    private repositoryHostname: string | undefined;
    private repositoryPort: number | undefined;
    private repository: IRepository | undefined;

    constructor(world: World) {
        this.orchestrator = world.orchestrator;
        this.cloudStorage = world.cloudStorage;
        this.localStorage = world.localStorage;
    }

    async deploy(
        specFile: string
    ): Promise<void> {
        //
        // The deploy functionality runs locally in the CLI application.
        //
        const spec = await loadLaboratory(specFile, this.localStorage);
        this.labHostname = spec.laboratory.host;
        this.labPort = spec.laboratory.port;
        this.deployLaboratory(spec.laboratory.host, spec.laboratory.port);

        this.repositoryHostname = spec.repository.host;
        this.repositoryPort = spec.repository.port;
        this.deployRepository(spec.repository.host, spec.repository.port);
    }

    private async deployLaboratory(host: string, port: number) {
        //
        // The deploy functionality runs locally in the CLI application.
        //

        console.log(`Depoying einstein Laboratory to ${host}`);
        console.log('Generating public/private key pair');
        // TODO: generate keys here and store in CLI local store
        // and in worker's attached volume.
        // TODO: use naming library for blob.
        // Two scenarios:
        //   1. Standing up a new server with new keys
        //   2. Restarting a server with existing keys
        const keys = generateKeys();
        const yamlText = yaml.safeDump(keys);
        const secrets = new RamDisk();
        secrets.writeBlob('keys', Buffer.from(yamlText, 'utf8'), true);
        const volume: Volume = {
            mount: 'secrets',
            storage: secrets
        };

        // Create worker for Laboratory
        this.orchestrator.createWorker(
            host,
            Laboratory.image.tag,
            this.cloudStorage,
            [volume],
            new Environment([['port', this.labPort!.toString()]]),
            new BlobLogger(this.cloudStorage, host, encodeLog(host))
        );
    }

    private async deployRepository(host: string, port: number) {
        //
        // The deploy functionality runs locally in the CLI application.
        //

        console.log(`Deploying einstein Repository to ${host}`);

        // Create worker for Repository
        this.orchestrator.createWorker(
            host,
            Repository.image.tag,
            this.cloudStorage,
            [],
            new Environment([['port', this.repositoryPort!.toString()]]),
            new BlobLogger(this.cloudStorage, host, encodeLog(host))
        );
    }

    async encrypt(filename: string): Promise<void> {
        //
        // The encrypt functionality gets the key from the lab, but then
        // performs the encryption locally in the CLI application.
        //
        const lab = await this.getLab();
        const publicKey = await lab.getPublicKey();

        const yamlText =
            (await this.localStorage.readBlob(filename)).toString('utf8');
        const data = yaml.safeLoad(yamlText);
        encryptSecrets(data, publicKey);
        const yamlText2 = yaml.safeDump(data);
        const buffer = Buffer.from(yamlText2, 'utf8');

        await this.localStorage.writeBlob(filename, buffer, true);

        console.log(`Encrypted ${filename}`);
    }

    async create(specFile: string): Promise<void> {
        //
        // Impemented as an RPC to the Lab service
        //
        const lab = await this.getLab();
        const spec = await loadEntity(specFile, this.localStorage, false);
        const destination = await lab.create(spec);
        console.log(`Uploaded to ${destination}`);
    }

    async list(collection: string): Promise<SelectResults> {
        //
        // Impemented as an RPC to the Repository service
        //
        const repository = await this.getRepository();
        
        // TODO: catch bad collection name
        return repository.select(getCollectionTable(collection));
    }

    async results(benchmarkId: string): Promise<SelectResults> {
        //
        // Impemented as an RPC to the Repository service
        //
        const repository = await this.getRepository();

        try {
            return await repository.selectFromResults(benchmarkId);
        } catch (e) {
            const message = `Unable to find results for benchmark ${benchmarkId}`;
            throw new TypeError(message);
        }
    }

    async run(candidateId: string, suiteId: string): Promise<void> {
        //
        // Impemented as an RPC to the Lab service
        //
        const lab = await this.getLab();
        await lab.run(candidateId, suiteId);
    }

    // async connect(hostname: string) {
    //     // Read hostname from connection file.
    //     this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    // }

    private async getLab(): Promise<ILaboratory> {
        if (!this.labHostname) {
            const message = 'Not connected to a Labratory';
            throw new TypeError(message);
        }
        if (!this.lab) {
            // TODO: better handling of connection timeout exception here.
            // TODO: don't hard-code port.
            this.lab = await this.orchestrator.connect<ILaboratory>(
                this.labHostname,
                this.labPort!
            );
        }
        return this.lab;
    }

    private async getRepository(): Promise<IRepository> {
        if (!this.repositoryHostname) {
            const message = 'Not connected to a Repository';
            throw new TypeError(message);
        }
        if (!this.repository) {
            // TODO: better handling of connection timeout exception here.
            // TODO: don't hard-code port.
            this.repository = await this.orchestrator.connect<IRepository>(
                this.repositoryHostname,
                this.repositoryPort!
            );
        }
        return this.repository;
    }
}
