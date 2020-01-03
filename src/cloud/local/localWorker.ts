import { IStorage, IOrchestrator, IWorker, Volume } from '../interfaces';

export class LocalWorker implements IWorker {
    orchestrator: IOrchestrator;
    hostname: string;
    cloudStorage: IStorage;
    localStorage: IStorage;

    constructor(
        orchestrator: IOrchestrator,
        hostname: string,
        cloudStorage: IStorage,
        volumes: Volume[]
    ) {
        this.orchestrator = orchestrator;
        this.hostname = hostname;

        this.cloudStorage = cloudStorage;

        // TODO: implement Volume[] => IStorage
        this.localStorage = (null as unknown) as IStorage;
    }

    getCloudStorage(): IStorage {
        return this.cloudStorage;
    }

    getFileSystem(): IStorage {
        return this.localStorage;
    }

    shutdown(): void {
        // TODO: remove from orchestrator hosts table.
    }

    bind<T>(stub: T, port: number): void {
        this.orchestrator.bind(stub, this.hostname, port);
    }

    async connect<T>(hostname: string, port: number): Promise<T> {
        return this.orchestrator.connect(hostname, port);
    }
}
