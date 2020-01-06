import { IWorker } from '../cloud';
import { Shell } from '../shell';

import { Benchmark, Candidate } from '../samples/true_or_false'
import { Laboratory } from '../laboratory';

async function go() {
    // TODO: pass orchestrator to Shell constructor,
    // so readline.Interface can be started as last step.
    // Don't want to take input until shell is fully intialized
    // This will allow async awaits before starting shell.
    const shell = new Shell();
    const finished = shell.finished();
    const orchestrator = shell.getOrchestrator();

    orchestrator.pushImage(Benchmark.image);
    orchestrator.pushImage(Candidate.image);
    orchestrator.pushImage(Laboratory.image);

    // Push client container image to repository.
    const clientImage = {
        tag: 'client:1.0',
        create: () => clientEntryPoint
    };
    orchestrator.pushImage(clientImage);

    // Push server container image to repository.
    const serverImage = {
        tag: 'server:1.0',
        create: () => serverEntryPoint
    };
    orchestrator.pushImage(serverImage);

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
