import { ColumnDescription } from "../cloud";

export enum Kind {
    BENCHMARK = 'Benchmark',
    CANDIDATE = 'Candidate',
    LABORATORY = 'Laboratory',
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

export interface LaboratoryDescription extends EntityDescription {
    kind: Kind.LABORATORY;

    laboratory: {
        host: string;
        port: number;
    }
    repository: {
        host: string;
        port: number;
    }
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
    // Important that data is 'object' and not 'Object'
    // 'object' specifies non-primitive and therefore doesn't
    // allow 'undefined'
    data: object
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
    
    run(candidateId: string, suiteId: string): Promise<void>;
}

// tslint:disable-next-line:interface-name
export interface IAnalysis {
    listCandidates(pattern: CandidateDescription): Promise<CandidateDescription[]>;
    listBenchmarks(pattern: CandidateDescription): Promise<BenchmarkDescription[]>;
    listRuns(pattern: SuiteDescription): Promise<RunDescription[]>;
    listSuites(pattern: SuiteDescription): Promise<BenchmarkDescription[]>;
}
