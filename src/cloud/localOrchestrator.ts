import { Image, IOrchestrator, IStorage, IWorker, Volume } from './interfaces';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class LocalWorker implements IWorker {
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

interface Host {
    // container: IContainer;

    // tslint:disable-next-line:no-any
    ports: Map<number, any>;
}

export class LocalOrchestrator implements IOrchestrator {
    hosts = new Map<string, Host>();
    images = new Map<string, Image>();

    maxRetries = 5;
    retryIntervalMS = 1000;

    pushImage(image: Image): void {
        if (this.images.has(image.tag)) {
            const message = "Attempting to push duplicate image ${image.tag}.";
            throw TypeError(message);
        }
        this.images.set(image.tag, image);
    }

    createWorker(
        hostname: string,
        tag: string,
        cloudStorage: IStorage,
        volumes: Volume[]
    ): void {
        const host = this.hosts.get(hostname);
        if (host !== undefined) {
            const message = "Host ${hostname} already exists.";
            throw TypeError(message);
        }
        const image = this.images.get(tag);
        if (image === undefined) {
            const message = "Image ${tag} not found.";
            throw TypeError(message);
        }
        const worker = new LocalWorker(
            this,
            hostname,
            cloudStorage,
            volumes
        );

        // Drop Promise<void> on the floor.
        image.create()(worker);
    }

    bind<T>(stub: T, hostname: string, port: number): void {
        const host = this.hosts.get(hostname);
        if (host) {
            const existing = host.ports.get(port);
            if (existing) {
                const message = `Port ${port} on host ${hostname} already in use.`
                throw TypeError(message);
            } else {
                existing.ports.set(port, stub);
            }
        } else {
            this.hosts.set(
                hostname,
                {
                    ports: new Map<number, T>([[port, stub]])
                }
            )
        }
    }

    async connect<T>(hostname: string, port: number): Promise<T> {
        let host: Host | undefined = undefined;
        let stub: T | undefined = undefined;

        for (let i=0; i<this.maxRetries; ++i) {
            host = this.hosts.get(hostname);
            if (host) {
                stub = host.ports.get(port);
                if (stub) {
                    return stub;
                }
            }
            await sleep(this.retryIntervalMS);
        }
        if (!host) {
            const message =`Unknown host ${hostname}.`;
            throw TypeError(message);
        } else {
            const message = `Timed out connecting to port ${port} on ${hostname}.`;
            throw TypeError(message);
        }
    }
}