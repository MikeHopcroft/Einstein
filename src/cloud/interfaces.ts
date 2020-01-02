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

// // tslint:disable-next-line:interface-name
// export interface IContainer {
//     run(): Promise<void>;
// }

export type EntryPoint = (worker: IWorker) => Promise<void>;

// tslint:disable-next-line:no-any
// type Image = () => EntryPoint;
export interface Image {
    tag: string;
    create(): EntryPoint;
}

// tslint:disable-next-line:interface-name
export interface IWorker {
    // getInterface<T>(): T;
    getCloudStorage(): IStorage;
    getFileSystem(): IStorage;
    shutdown(): void;
    bind<T>(stub: T, port: number): void;
    connect<T>(hostname: string, port: number): Promise<T>;
}

// tslint:disable-next-line:interface-name
export interface IOrchestrator {
    pushImage(image: Image): void;

    createWorker(
        hostname: string,
        tag: string,
        cloudStorage: IStorage,
        volumes: Volume[]
    ): void;

    bind<T>(stub: T, hostname: string, port: number): void;
    connect<T>(hostname: string, port: number): Promise<T>;
}

// tslint:disable-next-line:interface-name
export interface ICloud {
    storage: IStorage;
    orchestrator: IOrchestrator;
};
