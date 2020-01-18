import * as yaml from 'js-yaml';
import * as uuid from 'uuid';

import {
    Environment,
    IOrchestrator,
    IStorage,
    RamDisk,
    Volume,
    World,
    BlobLogger
} from '../cloud';

import { Laboratory, ILaboratory, SuiteDescription } from '../laboratory';
import { encodeBenchmark, encodeCandidate, encodeSuite, encodeLog } from '../naming';
import { encryptSecrets, generateKeys } from '../secrets';
import { loadSuite, loadCandidate, loadBenchmark, loadEntity } from '../laboratory/loaders';

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
        //
        // The deploy functionality runs locally in the CLI application.
        //

        console.log(`Depoying einstein to ${hostname}`);

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

        await this.localStorage.writeBlob(filename, buffer);
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

    async run(candidateId: string, suiteId: string): Promise<void> {
        //
        // Impemented as an RPC to the Lab service
        //
        const lab = await this.getLab();
        lab.run(candidateId, suiteId);
    }

    // async connect(hostname: string) {
    //     // Read hostname from connection file.
    //     this.lab = (await this.orchestrator.connect<ILaboratory>(hostname, 8080));
    // }

    private async getLab(): Promise<ILaboratory> {
        if (!this.hostName) {
            const message = 'Not connected to a Labratory';
            throw new TypeError(message);
        }
        if (!this.lab) {
            // TODO: better handling of connection timeout exception here.
            // TODO: don't hard-code port.
            this.lab = await this.orchestrator.connect<ILaboratory>(this.hostName, 8080);
        }
        return this.lab;
    }
}
