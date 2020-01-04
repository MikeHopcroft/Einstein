export interface EntityDescription {
    name: string;
    description: string;
    owner: string;
    created: string;
}

export interface BenchmarkDescription extends EntityDescription {
    image: string;
    // containerBaseName: string;
    // containerVersion: string;
}

export interface CandidateDescription extends EntityDescription {
    benchmarkId: string;
    image: string;
    // containerBaseName: string;
    // containerVersion: string;
}

// TODO: ISSUE: do suites refer to versioned or unversioned benchmark
// containers?
export interface SuiteDescription extends EntityDescription {
    benchmarkId: string;
    domainData: string[];
    testData: string[];
}

export interface RunDescription extends EntityDescription {
    runId: string;  // Probably a guid.
    benchmarkId: string;
    containerId: string;
    suiteId: string;
    results: string[];
}

export type UID = string;

// tslint:disable-next-line:interface-name
export interface ILaboratory {
    getPublicKey(): Promise<string>;

    createCandidate(description: CandidateDescription): Promise<UID>;
    listCandidates(pattern: CandidateDescription): Promise<CandidateDescription[]>;

    createBenchmark(description: BenchmarkDescription): Promise<UID>;
    listBenchmarks(pattern: CandidateDescription): Promise<BenchmarkDescription[]>;

    createSuite(description: SuiteDescription): Promise<UID>;
    listSuites(pattern: SuiteDescription): Promise<BenchmarkDescription[]>;

    run(candidateId: UID, suiteId: UID): Promise<void>;
}
