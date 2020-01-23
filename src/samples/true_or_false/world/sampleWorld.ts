import * as yaml from 'js-yaml';
import * as path from 'path';

import {
    ConsoleLogger,
    Environment,
    IStorage,
    RamDisk,
    LocalOrchestrator,
    LocalDisk,
    World,
} from '../../../cloud';

import {
    BenchmarkDescription,
    CandidateDescription,
    Kind,
    Laboratory,
    SuiteDescription
} from '../../../laboratory';

import { Repository } from '../../../repository';

import { Benchmark, Candidate, TrivialCandidate } from '..'

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
        logger: new ConsoleLogger('shell'),
        homedir: '/',
        cwd: '/'
    };

    world.orchestrator.pushImage(Benchmark.image);
    world.orchestrator.pushImage(Candidate.image);
    world.orchestrator.pushImage(TrivialCandidate.imageTrue);
    world.orchestrator.pushImage(TrivialCandidate.imageFalse);
    world.orchestrator.pushImage(Laboratory.image);
    world.orchestrator.pushImage(Repository.image);

    // TODO: copy sample yaml files to ramdisk
    copyYaml(world.localStorage, 'benchmark.yaml', benchmark);
    copyYaml(world.localStorage, 'candidate.yaml', candidate);
    copyYaml(world.localStorage, 'true_candidate.yaml', alwaysTrueCandidate);
    copyYaml(world.localStorage, 'false_candidate.yaml', alwaysFalseCandidate);
    copyYaml(world.localStorage, 'suite.yaml', suite);

    return world;
}

// tslint:disable-next-line:no-any
function copyYaml(storage: IStorage, filename: string, data: any) {
    const normalized = path.posix.join('/', filename);
    const yamlText = yaml.safeDump(data);
    storage.writeBlob(normalized, Buffer.from(yamlText, 'utf8'), true);
}

const benchmark: BenchmarkDescription = {
    apiVersion: '0.0.1',
    kind: Kind.BENCHMARK,
    name: 'True_Or_False',
    description: 'A sample benchmark for boolean expressions evaluation.',
    owner: 'Mike',
    created: '2020-01-07T04:09:18.721Z',
    image: 'true_or_false_benchmark:1.0',
    columns: [
        { name: 'candidateId', type: 'string' },
        { name: 'suiteId', type: 'string' },
        { name: 'created', type: 'string' },
        { name: 'passed', type: 'string' },
        { name: 'failed', type: 'string' }
    ]
};

const candidate: CandidateDescription = {
    apiVersion: '0.0.1',
    kind: Kind.CANDIDATE,
    name: 'True_Or_False',
    description: 'A sample candidate that implements a boolean expression parser.',
    owner: 'Mike',
    created: '2020-01-07T04:09:18.721Z',
    benchmarkId: 'true_or_false_benchmark:1.0',
    image: 'true_or_false_candidate:1.0',
    whitelist: [
        'http://www.wikipedia.org'
    ],
    data: {
        password: {
            secret: 'my-password'
        }
    },
};

const alwaysTrueCandidate: CandidateDescription = {
    apiVersion: '0.0.1',
    kind: Kind.CANDIDATE,
    name: 'Always_True',
    description: 'A candidate that always returns true.',
    owner: 'Briana',
    created: '2020-01-07T04:09:18.721Z',
    benchmarkId: 'true_or_false_benchmark:1.0',
    image: 'alwaysTrue_candidate:1.0',
    data: {},
    whitelist: [
        'http://www.wikipedia.org'
    ]
};


const alwaysFalseCandidate: CandidateDescription = {
    apiVersion: '0.0.1',
    kind: Kind.CANDIDATE,
    name: 'Always_False',
    description: 'A candidate that always returns false.',
    owner: 'Noel',
    created: '2020-01-07T04:09:18.721Z',
    benchmarkId: 'true_or_false_benchmark:1.0',
    image: 'alwaysFalse_candidate:1.0',
    data: {},
    whitelist: [
        'http://www.wikipedia.org'
    ]
};

const suite: SuiteDescription = {
    apiVersion: '0.0.1',
    kind: Kind.SUITE,
    name: 'True_Or_False',
    description: 'A sample suite.',
    owner: 'Mike',
    created: '2020-01-07T04:09:18.721Z',
    benchmarkId: 'true_or_false_benchmark:1.0',
    data: {
        domainData: [
            { name: 'a', value: true },
            { name: 'b', value: true },
            { name: 'c', value: true },
            { name: 'x', value: false },
            { name: 'y', value: false },
            { name: 'z', value: false }
        ],
        testCases: [
            { input: 'a', expected: true },
            { input: 'b', expected: true },
            { input: 'x', expected: false },
            { input: '!a', expected: false },
            { input: '!b', expected: false },
            { input: '!x', expected: true },
            { input: '(a)', expected: true },
            { input: '(x)', expected: false },
            { input: 'a & b', expected: true },
            { input: 'a & b & c', expected: true },
            { input: 'a & x', expected: false },
            { input: 'a & b & x', expected: false },
            { input: 'a | b', expected: true },
            { input: 'a | x', expected: true },
            { input: 'x | y | z | a', expected: true },
            { input: 'x | y', expected: false },
            { input: '!(x & y)', expected: true },
            { input: '!(a | b)', expected: false },
            { input: '!a & !x', expected: false },
            { input: '!x & !y', expected: true },
            { input: '!a & !b', expected: false },
            { input: '!x & !b', expected: false },
            { input: '!!a', expected: true },
            { input: '!!!a', expected: false },
            { input: 'x & a | b', expected: true },
            { input: '(x & a) | b', expected: true },
            { input: 'x & (a | b)', expected: false },
            {
                input: '((a | x) & (b | y) & ((c | x) | (d | y)))',
                expected: true
            },
            { input: 'foo', expected: true },
            { input: 'bar', expected: true },
            { input: 'foo-bar', expected: true },
            { input: 'foo & bar & !baz-baz', expected: true },
            { input: '    a   &b & c   ', expected: true },
            { input: 'a&b&c', expected: true },
            { input: '(a&b', expected: "Expected ')'" },
            { input: '(a|b', expected: "Expected ')'" },
            { input: 'a&', expected: 'Expected a variable' },
            { input: 'a |', expected: 'Expected a variable' },
            { input: '&', expected: 'Unexpected operator "&"' },
            { input: '|', expected: 'Unexpected operator "|"' },
            { input: '!', expected: 'Expected a variable' },
            { input: '(', expected: 'Expected a variable' },
            { input: ')', expected: 'Unexpected operator ")"' },
            { input: 'a b', expected: "Expected '&' or '|' operator" },
            { input: '(a+b))', expected: "Expected '&' or '|' operator" },
            { input: '', expected: 'Expected a variable' },
            { input: '   ', expected: 'Expected a variable' }
        ]
    }
};
