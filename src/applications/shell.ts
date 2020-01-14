import { sampleWorld } from '../samples';
import { Shell } from '../shell';

async function go() {
    // TODO: remove hard-coded path.
    const world = sampleWorld();
    const shell = new Shell(world);
    const finished = shell.finished();
    await finished;
    // console.log('exiting');
}

go();
