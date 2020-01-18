import { sampleWorld } from '../samples';
import { Shell } from '../shell';

async function go() {
    const world = sampleWorld();
    const shell = new Shell(world);
    const finished = shell.finished();
    await finished;
}

go();
