import * as yaml from 'js-yaml';
import * as fs from 'fs';

import { RamDisk } from '../../cloud';

import { Benchmark, SymbolTable, TestSuite } from './benchmark';
import { Candidate } from './candidate';

async function go(domainDataFile: string, suiteFile: string) {
    try {
        // const domainData =
        //     yaml.safeLoad(fs.readFileSync(domainDataFile, 'utf8')) as SymbolTable;
        // const suite =
        //     yaml.safeLoad(fs.readFileSync(suiteFile, 'utf8')) as TestSuite;

        const cloudStorage = new RamDisk();
        await cloudStorage.writeBlob(
            'domainData',
            fs.readFileSync(domainDataFile)
        );
        await cloudStorage.writeBlob(
            'suite',
            fs.readFileSync(suiteFile)
        );

        const benchmarkStorage = new RamDisk();
        await benchmarkStorage.writeBlob(
            'secrets.txt',
            Buffer.from('benchmark secrets', 'utf-8')
        );

        console.log('constructing candidate');
        const candidate = new Candidate();
        const benchmark = new Benchmark(cloudStorage, benchmarkStorage);
        await benchmark.run(candidate);

        console.log('Sample: list of blobs in cloud storage:');
        for (const blob of (await cloudStorage.listBlobs())) {
            console.log(`  ${blob}`);
        }

        const results = 
            (await cloudStorage.readBlob('results')).toString('utf-8');
        console.log("Results:");
        console.log(results);
    } catch (e) {
        if (e instanceof Error) {
            console.log(`Caught exception ${e.message}`);
        } else {
            console.log(`Caught unknown exception`);
        }
    }
}

go(
    'd:\\git\\einstein\\src\\samples\\suites\\domain.yaml',
    'd:\\git\\einstein\\src\\samples\\suites\\simple.yaml'
);
