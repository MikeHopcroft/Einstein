// This is the skeleton for an integration test.

import {
    sampleWorld
} from '../../../src/samples'

import {
    CLI,
    Repository,
    sleep,
    formatTable,
    formatSelectResults,
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

    console.log('Creating suite');
    await cli.create('/suite.yaml');

    console.log('Creating candidate');
    await cli.create('/candidate.yaml');
    // TODO: need candidate.yaml files for alwaysFalse and alwaysTrue.

    console.log('Running test');
    await cli.run('true_or_false_candidate:1.0','True_Or_False');
    // await cli.run('alwaysFalse_candidate:1.0','True_Or_False');
    // await cli.run('alwaysTrue_candidate:1.0','True_Or_False');

    console.log('Selecting from benchmarks table');
    {
        const results = await repository.select('benchmarks');
        for (const line of formatSelectResults(results)) {
            console.log(line);
        }
    }

    console.log('Selecting from candidates table');
    {
        const results = await repository.select('candidates');
        for (const line of formatSelectResults(results)) {
            console.log(line);
        }
    }

    console.log('Selecting from suites table');
    {
        const results = await repository.select('suites');
        for (const line of formatSelectResults(results)) {
            console.log(line);
        }
    }

    await sleep(20000);
    console.log('Selecting from results table');
    {
        const results = await repository.select('true_or_false_benchmark:1.0');
        for (const line of formatSelectResults(results)) {
            console.log(line);
        }
    }

    console.log('done');
}

go();
