import * as yaml from 'js-yaml';
import * as path from 'path';

import {
    Environment,
    IStorage,
    RamDisk,
    LocalOrchestrator,
    LocalDisk,
    World,
} from '../../cloud';

import { Laboratory } from '../../laboratory';

import { Benchmark, Candidate } from '../true_or_false'

// TODO: suppress localStorage initialization on disk.
// Don't want to overwrite yaml files on disk.
export function sampleWorld(localDiskPath?: string) {
    const localStorage = 
        localDiskPath ? new LocalDisk(localDiskPath) : new RamDisk();
    const world: World = {
        hostname:'console',
         // The sampleWorld is not modelled as running in a container
         // so just supply bogus tagname.
        tagname: 'unused',
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

    // TODO: copy sample yaml files to ramdisk
    copyYaml(world.localStorage, 'benchmark.yaml', benchmark);
    copyYaml(world.localStorage, 'candidate.yaml', candidate);
    copyYaml(world.localStorage, 'suite.yaml', suite);

    return world;
}

// tslint:disable-next-line:no-any
function copyYaml(storage: IStorage, filename: string, data: any) {
    const normalized = path.posix.join('/', filename);
    const yamlText = yaml.safeDump(data);
    storage.writeBlob(normalized, Buffer.from(yamlText, 'utf8'));
}

const benchmark = {
    name: 'True_Or_False',
    description: 'A sample benchmark for boolean expressions evaluation.',
    owner: 'Mike',
    created: '2020-01-07T04:09:18.721Z',
    image: 'myregistry.azurecr.io/true_or_false_benchmark:1.0'
};

const candidate = {
    name: 'True_Or_False',
    description: 'A sample candidate that implements a boolean expression parser.',
    owner: 'Mike',
    created: '2020-01-07T04:09:18.721Z',
    benchmarkId: 'true_or_false_benchmark:1.0',
    image: 'myregistry.azurecr.io/true_or_false_candidate:1.0',
    password: {
        secret: 'my-password'
    },
    whitelist: [
        'http://www.wikipedia.org'
    ]
};

const suite = {
    name: 'True_Or_False',
    description: 'A sample suite.',
    owner: 'Mike',
    created: '2020-01-07T04:09:18.721Z',
    benchmarkId: 'true_or_false_benchmark:1.0',
    domainData: [],
    testData: []
};
