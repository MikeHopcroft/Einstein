import { Environment, IWorker, LocalOrchestrator, RamDisk } from '../cloud';
import { sleep } from '../utilities';

async function clientEntryPoint(worker: IWorker) {
    // await sleep(2000);
    console.log(`client: clientEntryPoint()`);

    console.log('client: connecting');
    const service = (await worker.connect<IService>('server1', 8080)) as IService;
    console.log('client: connected');

    console.log('client: service.doSomething()');
    await service.doSomething();
}

async function serverEntryPoint(worker: IWorker) {
    console.log(`serverEntryPoint()`);

    // Simulate server startup time.
    console.log('server: sleeping');
    await sleep(100);
    console.log('server: awoke');

    // Construct and bind service RPC stub. 
    const myService = new MyService();
    worker.bind(myService, 8080);
}

// tslint:disable-next-line:interface-name
interface IService {
    doSomething(): Promise<void>;
}

class MyService implements IService {
    async doSomething(): Promise<void> {
        console.log('MyService invoked.');
    }
}

async function go() {
    // Create orchestrator.
    const orchestrator = new LocalOrchestrator();

    // Push client container image to repository.
    const clientImage = {
        tag: 'myregistry.azurecr.io/client:1.0',
        create: () => clientEntryPoint
    };
    orchestrator.pushImage(clientImage);

    // Push server container image to repository.
    const serverImage = {
        tag: 'myregistry.azurecr.io/server:1.0',
        create: () => serverEntryPoint
    };
    orchestrator.pushImage(serverImage);

    // Set up cloud storage.
    const cloudStorage = new RamDisk();

    // Start client and server containers.
    orchestrator.createWorker(
        'client1',
        'myregistry.azurecr.io/client:1.0',
        cloudStorage,
        [],
        new Environment()
    );

    orchestrator.createWorker(
        'server1',
        'myregistry.azurecr.io/server:1.0',
        cloudStorage,
        [],
        new Environment()
    );
}

go();
