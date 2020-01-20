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

    await sleep(10000);

    // console.log('Creating benchmark');
    // await cli.create('/benchmark.yaml');

    console.log('Creating repository');
    const repository = new Repository(world);
    console.log('Initializing repository');
    await repository.initialize();

    console.log('Creating benchmark2');
    await cli.create('/benchmark.yaml');

    console.log('Selecting');
    const { columns, rows } = await repository.select('benchmarks');
    console.log(columns.map(a => a.name).join(' | '));
    for (const row of rows) {
        console.log(row.join(' | '));
    }

    console.log('done');
}

go();
