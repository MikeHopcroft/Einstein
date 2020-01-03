export interface TestCase {
    input: string;
    expected: boolean | string;
}

export interface TestSuite {
    name: string;
    description: string;
    benchmark: string;
    domainData: string;
    cases: TestCase[];
}

export type SymbolTable = SymbolDefinition[];

export interface SymbolDefinition {
    name: string;
    value: boolean;
}

// tslint:disable-next-line:interface-name
export interface ICandidate {
    ready(): Promise<boolean>;
    initialize(symbols: SymbolTable): Promise<void>;
    runCase(input: string): Promise<boolean | string>;

    // TODO: ISSUE: should training cases be passed one-by-one or in a batch?
    // trainingCase(input: string, expected: boolean | string): void;

    shutdown(): Promise<void>;
}
