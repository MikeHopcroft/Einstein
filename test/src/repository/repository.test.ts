// This is the skeleton for an integration test.

import {
    sampleWorld
} from '../../../src/samples'

import {
    CLI,
    Repository,
    sleep,
} from '../../../src';

async function go() {
    const world = sampleWorld();
    const cli = new CLI(world);

    await cli.deploy('lab');

    sleep(10000);

    await cli.create('/benchmark.yaml');

    const repository = new Repository(world);
    await repository.initialize();

    console.log('done');
}

go();
