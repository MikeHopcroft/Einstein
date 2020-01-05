import { Readable } from 'stream';

import { IWorker } from '../cloud';
import { Shell, StdoutCapture } from '../shell';
import { sleep } from '../utilities';

async function go() {
    const input2 = new Readable();
    input2.push('cd a\n');
    input2.push('cd b\n');
    input2.push('pwd\n');
    input2.push(null);

    // const capture = new StdoutCapture();
    // capture.start();

    // TODO: pass orchestrator to shell, so shell can be started last.
    // This will allow async awaits before starting shell.
    const shell = new Shell({input: input2, capture: true});
    const finished = shell.finished();
    const orchestrator = shell.getOrchestrator();

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
    // await sleep(1);
    // console.log('exiting');

    console.log('???????????????????????????????????????');
    console.log(shell.getOutput());
    // capture.stop();
    // console.log('=====');
    // console.log(capture.output);
}

// async function go2()
// {
//     const shell = await go();
//     // await sleep(1);
//     console.log('exiting');

//     console.log('=====');
//     console.log(shell.getOutput());
// }

async function clientEntryPoint(worker: IWorker) {
    // await sleep(2000);
    console.log(`client: clientEntryPoint()`);
}

async function serverEntryPoint(worker: IWorker) {
    // await sleep(2000);
    console.log(`server: serverEntryPoint()`);
}

go();
