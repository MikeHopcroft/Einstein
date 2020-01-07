import { sleep } from '../../utilities';

import { Image, IOrchestrator, IStorage, Volume, IEnvironment } from '../interfaces';

import { LocalWorker } from './localWorker';

export interface Host {
    // Map of port numbers to RPC stubs.
    // tslint:disable-next-line:no-any
    ports: Map<number, any>;
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

    async listServices(): Promise<string[]> {
        const services = [];
        for (const [hostname, x] of this.hosts.entries()) {
            for (const port of x.ports.keys()) {
                services.push(`${hostname}:${port}`);
            }
        }
        return services;
    }

    createWorker(
        hostname: string,
        tag: string,
        cloudStorage: IStorage,
        volumes: Volume[],
        environment: IEnvironment
    ): void {
        const host = this.hosts.get(hostname);
        if (host !== undefined) {
            const message = `Host ${hostname} already exists.`;
            throw TypeError(message);
        }
        const image = this.images.get(tag);
        if (image === undefined) {
            const message = `Image ${tag} not found.`;
            throw TypeError(message);
        }
        const worker = new LocalWorker(
            this,
            hostname,
            cloudStorage,
            volumes,
            environment
        );

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