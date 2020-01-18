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
}

export interface CandidateDescription extends EntityDescription {
    kind: Kind.CANDIDATE,
    benchmarkId: string;
    image: string;
}

// TODO: ISSUE: do suites refer to versioned or unversioned benchmark
// containers?
export interface SuiteDescription extends EntityDescription {
    kind: Kind.SUITE,
    benchmarkId: string;
}

export interface RunDescription extends EntityDescription {
    kind: Kind.RUN,
    runId: string;
    candidateId: string;
    benchmarkId: string;
    suiteId: string;
    // tslint:disable-next-line:no-any
    results: any;
}

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
