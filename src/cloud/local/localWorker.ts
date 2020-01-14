import {
    IEnvironment,
    IOrchestrator,
    IStorage,
    IWorker,
    Volume,
    World
} from '../interfaces';

export class LocalWorker implements IWorker {
    private world: World;
    private orchestrator: IOrchestrator;
    private hostname: string;
    private cloudStorage: IStorage;
    private localStorage: IStorage;
    private environment: IEnvironment;

    constructor(world: World) {
        this.world = world;
        this.orchestrator = world.orchestrator;
        this.hostname = world.hostname;
        this.cloudStorage = world.cloudStorage;
        this.localStorage = world.localStorage;
        this.environment = world.environment;
    }

    getWorld(): World {
        return this.world;
    }

    getCloudStorage(): IStorage {
        return this.cloudStorage;
    }

    getFileSystem(): IStorage {
        return this.localStorage;
    }

    getEnvironment(): IEnvironment {
        return this.environment;
    }

    shutdown(): void {
        // TODO: REVIEW: this kills the entire host instead of the port binding. Is this correct?
        // Remove from orchestrator hosts table.
        this.orchestrator.killWorker(this.world.hostname);
    }

    bind<T>(world: World, stub: T, port: number): void {
        this.orchestrator.bind(world, stub, port);
    }

    async connect<T>(hostname: string, port: number): Promise<T> {
        return this.orchestrator.connect<T>(hostname, port);
    }

    log(message: string) {
        this.world.logger.log(message);
    }
}
