import { IStorage, IOrchestrator, IWorker, Volume } from '../interfaces';
import { RamDisk } from './ramdisk';

export class LocalWorker implements IWorker {
    private orchestrator: IOrchestrator;
    private hostname: string;
    private cloudStorage: IStorage;
    private localStorage: IStorage;

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
        // this.localStorage = (null as unknown) as IStorage;
        // For now, just take first Volume. Ignore mount point.
        if (volumes.length === 1) {
            this.localStorage = volumes[0].storage;
        } else if (volumes.length === 0) {
            this.localStorage = new RamDisk();
        } else {
            const message = "LocalWorker.constructor: expected zero or one volumes";
            throw TypeError(message);
        }
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
