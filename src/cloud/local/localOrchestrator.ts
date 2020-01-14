import { RamDisk } from '../../cloud';
import { sleep } from '../../utilities';

import {
    Image,
    IEnvironment,
    ILogger,
    IOrchestrator,
    IStorage,
    Volume,
    World,
    ServiceInfo
} from '../interfaces';

import { ConsoleLogger } from './consoleLogger';
import { LocalWorker } from './localWorker';

export interface Service {
    world: World;
    port: number;
    // tslint:disable-next-line:no-any
    rpcStub: any;
}
export interface Host {
    // Map of port numbers to RPC stubs.
    // tslint:disable-next-line:no-any
    ports: Map<number, Service>;
}

export class LocalOrchestrator implements IOrchestrator {
    private hosts = new Map<string, Host>();
    private images = new Map<string, Image>();

    private maxRetries = 30;
    private retryIntervalMS = 1000;

    pushImage(image: Image): void {
        if (this.images.has(image.tag)) {
            const message = "Attempting to push duplicate image ${image.tag}.";
            throw TypeError(message);
        }
        this.images.set(image.tag, image);
    }

    async listImages(): Promise<string[]> {
        return [...this.images.values()].map(x => x.tag);
    }

    async listServices(): Promise<ServiceInfo[]> {
        const services = [];
        for (const [hostname, host] of this.hosts.entries()) {
            for (const [port, service] of host.ports.entries()) {
                services.push({
                    hostname,
                    tag: service.world.tagname,
                    port
                });
            }
        }
        return services;
    }

    createWorker(
        hostname: string,
        tagname: string,
        cloudStorage: IStorage,
        volumes: Volume[],
        environment: IEnvironment,
        logger: ILogger
    ): void {
        const host = this.hosts.get(hostname);
        if (host !== undefined) {
            const message = `Host ${hostname} already exists.`;
            throw TypeError(message);
        }
        const image = this.images.get(tagname);
        if (image === undefined) {
            const message = `Image ${tagname} not found.`;
            throw TypeError(message);
        }

        // TODO: correct implementation.
        // For now, just create LocalStorage from the first Volume. Ignore mount point.
        let localStorage: IStorage;
        if (volumes.length === 1) {
            localStorage = volumes[0].storage;
        } else if (volumes.length === 0) {
            localStorage = new RamDisk();
        } else {
            const message = "createWorker(): expected zero or one volumes";
            throw TypeError(message);
        }

        const world: World = {
            hostname,
            tagname,
            cloudStorage,
            localStorage,
            orchestrator: this,
            environment,
            logger,
            homedir: '/',
            cwd: '/'
        };

        const worker = new LocalWorker(world);

        // Drop Promise<void> on the floor.
        image.create()(worker);
    }

    killWorker(hostname: string) {
        if (this.hosts.has(hostname)) {
            this.hosts.delete(hostname);
        } else {
            const message = `Attempting to kill worker on unknown host ${hostname}.`;
            throw TypeError(message);
        }
    }

    bind<T>(world: World, rpcStub: T, port: number): void {
        const hostname = world.hostname;
        const host = this.hosts.get(hostname);
        const service: Service = {
            world,
            port,
            rpcStub
        }
        if (host) {
            const existing = host.ports.get(port);
            if (existing) {
                const message = `Port ${port} on host ${hostname} already in use.`;
                throw TypeError(message);
            } else {
                host.ports.set(port, service);
            }
        } else {
            this.hosts.set(
                hostname,
                {
                    ports: new Map<number, Service>([[port, service]])
                }
            )
        }
    }

    async connect<T>(hostname: string, port: number): Promise<T> {
        let host: Host | undefined = undefined;

        for (let i=0; i<this.maxRetries; ++i) {
            host = this.hosts.get(hostname);
            if (host) {
                const service = host.ports.get(port);
                if (service) {
                    return service.rpcStub;
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