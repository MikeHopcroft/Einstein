// tslint:disable-next-line:interface-name
export interface IStorage {
    // TODO: blob creation/update/delete events
    writeBlob(name: string, buffer: Buffer): Promise<void>;
    readBlob(name: string): Promise<Buffer>;
    listBlobs(prefix?: string): Promise<string[]>;
}

export interface Volume {
    mount: string;
    storage: IStorage;
}

export type EntryPoint = (worker: IWorker) => Promise<void>;

//
// An Image is analogous to a container image.
//
export interface Image {
    tag: string;

    // Factory for image EntryPoints.
    // Analogous to creating a container.
    create(): EntryPoint;
}

//
// An IWorker is analogous to a running container.
//
// tslint:disable-next-line:interface-name
export interface IWorker {
    // Returns the cloud storage available to this worker.
    getCloudStorage(): IStorage;

    // Returns this worker's local filesystem.
    getFileSystem(): IStorage;

    // Makes an RPC interface stub available on a specified port.
    bind<T>(stub: T, port: number): void;

    // Gets an RPC stub for a port on a specified host.
    connect<T>(hostname: string, port: number): Promise<T>;

    // Removes this worker from its IOrchestrator.
    // Equvalent to a container process exiting.
    // Note: worker should return immediately after this call.
    // TODO: should this take an exit code?
    shutdown(): void;
}

//
// An IOrchestrator manages containers and images.
// It is analogous to a container registery, paired with docker-compose or
// kubernetes.
//
// tslint:disable-next-line:interface-name
export interface IOrchestrator {
    // Pushes an Image to the registery.
    pushImage(image: Image): void;

    // Creates an IWorker running in a specified image.
    // Analogous to running a container.
    createWorker(
        hostname: string,
        imageTag: string,
        cloudStorage: IStorage,
        volumes: Volume[]
    ): void;

    // Removes the worker from the hosts table.
    // Analogous to killing a container process.
    killWorker(hostname: string): void;

    // Makes an RPC interface stub available on a specified port.
    bind<T>(stub: T, hostname: string, port: number): void;

    // Gets an RPC stub for a port on a specified host.
    connect<T>(hostname: string, port: number): Promise<T>;
}

// tslint:disable-next-line:interface-name
export interface ICloud {
    storage: IStorage;
    orchestrator: IOrchestrator;
};
