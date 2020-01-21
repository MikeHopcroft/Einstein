import { ColumnDescription } from "../cloud";

export enum Kind {
    BENCHMARK = 'Benchmark',
    CANDIDATE = 'Candidate',
    RUN = 'Run',
    SUITE = 'Suite',
    WHITELIST = 'Whitelist'
}

export interface EntityDescription {
    apiVersion: string,
    kind: Kind,
    name: string;
    description: string;
    owner: string;
    created: string;
}

export interface BenchmarkDescription extends EntityDescription {
    kind: Kind.BENCHMARK,
    image: string;
    columns: ColumnDescription[]
}

export interface CandidateDescription extends EntityDescription {
    kind: Kind.CANDIDATE,
    benchmarkId: string;
    image: string;
    whitelist: string[];
    // Important that data is 'object' and not 'Object'
    // 'object' specifies non-primitive and therefore doesn't
    // allow 'undefined'
    data: object
}

// TODO: ISSUE: do suites refer to versioned or unversioned benchmark
// containers?
export interface SuiteDescription extends EntityDescription {
    kind: Kind.SUITE,
    benchmarkId: string;
    // Important that data is 'object' and not 'Object'
    // 'object' specifies non-primitive and therefore doesn't
    // allow 'undefined'
    data: object
}

export interface RunDescription extends EntityDescription {
    kind: Kind.RUN,
    runId: string;
    candidateId: string;
    benchmarkId: string;
    suiteId: string;
    // data: {
    //     // tslint:disable-next-line:no-any
    //     [key: string]: any,
    // };
    // Important that data is 'object' and not 'Object'
    // 'object' specifies non-primitive and therefore doesn't
    // allow 'undefined'
    // tslint:disable-next-line:no-any
    data: object
    // tslint:disable-next-line:no-any
    // results: any;
}

// TODO: Make this any "uploadable" description by excluding RunDescription?
export type AnyDescription = 
    BenchmarkDescription |
    CandidateDescription |
    RunDescription |
    SuiteDescription;

// tslint:disable-next-line:interface-name
export interface ILaboratory {
    getPublicKey(): Promise<string>;

    create(description: AnyDescription): Promise<string>;

    // createCandidate(description: CandidateDescription): Promise<string>;
    
    // createBenchmark(description: BenchmarkDescription): Promise<string>;
    
    // createSuite(description: SuiteDescription): Promise<string>;
    
    run(candidateId: string, suiteId: string): Promise<void>;
}

// tslint:disable-next-line:interface-name
export interface IAnalysis {
    listCandidates(pattern: CandidateDescription): Promise<CandidateDescription[]>;
    listBenchmarks(pattern: CandidateDescription): Promise<BenchmarkDescription[]>;
    listRuns(pattern: SuiteDescription): Promise<RunDescription[]>;
    listSuites(pattern: SuiteDescription): Promise<BenchmarkDescription[]>;
}
