import { IWorker } from '../cloud';
import { sampleWorld } from '../samples';
import { Shell } from '../shell';

async function go() {
    // TODO: pass orchestrator to Shell constructor,
    // so readline.Interface can be started as last step.
    // Don't want to take input until shell is fully intialized
    // This will allow async awaits before starting shell.
    // const world: World = {
    //     hostname:'console',
    //     cloudStorage: new RamDisk(),
    //     localStorage: new RamDisk(),
    //     orchestrator: new LocalOrchestrator(),
    //     environment: new Environment(),
    //     homedir: '/',
    //     cwd: '/'
    // };

    // world.orchestrator.pushImage(Benchmark.image);
    // world.orchestrator.pushImage(Candidate.image);
    // world.orchestrator.pushImage(Laboratory.image);
    const world = sampleWorld('c:/temp/einstein');

    const shell = new Shell(world);
    const finished = shell.finished();
    const orchestrator = shell.getOrchestrator();


    // // Push client container image to repository.
    // const clientImage = {
    //     tag: 'client:1.0',
    //     create: () => clientEntryPoint
    // };
    // orchestrator.pushImage(clientImage);

    // // Push server container image to repository.
    // const serverImage = {
    //     tag: 'server:1.0',
    //     create: () => serverEntryPoint
    // };
    // orchestrator.pushImage(serverImage);

    await finished;
    console.log('exiting');
}

async function clientEntryPoint(worker: IWorker) {
    // Simulate startup time.
    // await sleep(2000);
    console.log(`client: clientEntryPoint()`);
}

async function serverEntryPoint(worker: IWorker) {
    // Simulate startup time.
    // await sleep(2000);
    console.log(`server: serverEntryPoint()`);
}

go();
