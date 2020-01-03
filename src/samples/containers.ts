import { IWorker, LocalOrchestrator, RamDisk } from '../cloud';
import { sleep } from '../utilities';

async function clientEntryPoint(worker: IWorker) {
    // await sleep(2000);
    console.log(`client: clientEntryPoint()`);

    console.log('client: connecting');
    const service = (await worker.connect<IService>('server1', 8080)) as IService;
    console.log('client: connected');

    console.log('client: service.doSomething()');
    await service.doSomething();
    // const maxTries = 5;
    // for (let i=0; i<maxTries; ++i) {
    //     try {
    //         const service = await worker.connect<IService>('server1', 8080);
    //     } catch (e) {

    //     }
    //     await sleep(1000);
    // }
}

// type IService = () => void;

// function service() {
//     console.log('serivce invoked');
// }

async function serverEntryPoint(worker: IWorker) {
    console.log(`serverEntryPoint()`);

    console.log('server: sleeping');
    await sleep(100);
    console.log('server: awoke');

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
    const cloudStorage = new RamDisk();

    const orchestrator = new LocalOrchestrator();

    const clientImage = {
        tag: 'client',
        create: () => clientEntryPoint
    };
    orchestrator.pushImage(clientImage);

    const serverImage = {
        tag: 'server',
        create: () => serverEntryPoint
    };
    orchestrator.pushImage(serverImage);

    orchestrator.createWorker('client1', 'client', cloudStorage, []);
    orchestrator.createWorker('server1', 'server', cloudStorage, []);
}

go();
