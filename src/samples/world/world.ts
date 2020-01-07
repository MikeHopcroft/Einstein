import {
    Environment,
    World,
    RamDisk,
    LocalOrchestrator,
    LocalDisk
} from '../../cloud';

import { Laboratory } from '../../laboratory';

import { Benchmark, Candidate } from '../true_or_false'

// TODO: suppress localStorage initialization on disk.
export function sampleWorld(localDiskPath?: string) {
    const localStorage = 
        localDiskPath ? new LocalDisk(localDiskPath) : new RamDisk();
    const world: World = {
        hostname:'console',
        cloudStorage: new RamDisk(),
        localStorage,
        orchestrator: new LocalOrchestrator(),
        environment: new Environment(),
        homedir: '/',
        cwd: '/'
    };

    world.orchestrator.pushImage(Benchmark.image);
    world.orchestrator.pushImage(Candidate.image);
    world.orchestrator.pushImage(Laboratory.image);

    // TODO: copy yaml files to ramdisk

    return world;
}