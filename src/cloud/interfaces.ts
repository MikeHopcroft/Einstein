// tslint:disable-next-line:interface-name
export interface IStorage {
    // TODO: blob creation/update/delete events
    appendBlob(name: string, buffer: Buffer): Promise<void>;
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

// tslint:disable-next-line:interface-name
export  interface IEnvironment {
    get(name: string): string;
    set(name: string, value: string): void;
    has(name: string): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
    entries(): IterableIterator<[string, string]>;
}

// tslint:disable-next-line:interface-name
export interface ILogger {
    log: (message: string) => Promise<void>;
}

//
// An IWorker is analogous to a running container.
//
// tslint:disable-next-line:interface-name
export interface IWorker {
    getWorld(): World;

    // Returns the cloud storage available to this worker.
    getCloudStorage(): IStorage;

    // TODO: rename to getLocalStorage()?
    // Returns this worker's local filesystem.
    getFileSystem(): IStorage;

    getEnvironment(): IEnvironment;

    // Makes an RPC interface stub available on a specified port.
    bind<T>(world: World, stub: T, port: number): void;

    // Gets an RPC stub for a port on a specified host.
    connect<T>(hostname: string, port: number): Promise<T>;

    // Removes this worker from its IOrchestrator.
    // Equvalent to a container process exiting.
    // Note: worker should return immediately after this call.
    // TODO: should this take an exit code?
    shutdown(): void;

    log(message: string): void;
}

export interface ServiceInfo {
    hostname: string;
    tag: string;
    port: number;
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

    // Returns list of tags of images previously pushed.
    listImages(): Promise<string[]>;

    // Returns list of services currently running.
    listServices(): Promise<ServiceInfo[]>;

    // Creates an IWorker running in a specified image.
    // Analogous to running a container.
    createWorker(
        hostname: string,
        imageTag: string,
        cloudStorage: IStorage,
        volumes: Volume[],
        environment: IEnvironment,
        logger: ILogger
    ): void;

    // Removes the worker from the hosts table.
    // Analogous to killing a container process.
    killWorker(hostname: string): void;

    // Makes an RPC interface stub available on a specified port.
    bind<T>(world: World, stub: T, port: number): void;

    // Gets an RPC stub for a port on a specified host.
    connect<T>(hostname: string, port: number): Promise<T>;
}

// tslint:disable-next-line:interface-name
export interface ICloud {
    storage: IStorage;
    orchestrator: IOrchestrator;
};

export interface World {
    hostname: string;
    tagname: string;
    cloudStorage: IStorage;
    localStorage: IStorage;
    orchestrator: IOrchestrator;
    environment: IEnvironment;
    logger: ILogger;
    homedir: string;
    cwd: string;
}
