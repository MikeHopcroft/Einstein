// This is the skeleton for an integration test.

import {
    sampleWorld
} from '../../../src/samples'

import {
    CLI,
    Repository,
    sleep,
    formatTable,
    formatTable2,
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

    console.log('Running test');
    await cli.run('true_or_false_candidate:1.0','True_Or_False');

    console.log('Selecting from benchmarks table');
    {
        const { columns, rows } = await repository.select('benchmarks');

        for (const line of formatTable2(columns, rows)) {
            console.log(line);
        }
        // console.log(columns.map(a => a.name).join(' | '));
        // for (const row of rows) {
        //     console.log(row.join(' | '));
        // }
    }

    await sleep(20000);
    console.log('Selecting from results table');
    {
        const { columns, rows } = await repository.select('true_or_false_benchmark:1.0');
        for (const line of formatTable2(columns, rows)) {
            console.log(line);
        }

        // // console.log(columns.map(a => a.name).join(' | '));
        // // for (const row of rows) {
        // //     console.log(row.join(' | '));
        // // }
        // const alignments = columns.map(x => 'right');
        // // const contents = [columns, ...rows];
        // const contents: string[][] = [];
        // contents.push(columns.map(x => x.name));
        // for (const row of rows) {
        //     // tslint:disable-next-line:no-any
        //     contents.push(row.map((x:any) => x.toString()));
        // }

        // for (const line of formatTable(alignments, contents)) {
        //     console.log(line);
        // }
    }

    console.log('done');
}

go();
