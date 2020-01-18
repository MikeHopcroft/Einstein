import { SuiteDescription } from "../../../laboratory";

export interface TestCase {
    input: string;
    expected: boolean | string;
}

export interface SymbolDefinition {
    name: string;
    value: boolean;
}

export type Symbols = SymbolDefinition[];

// TODO: extends SuiteDescription
export interface TestSuite {
    domainData: Symbols;
    testCases: TestCase[];
}

// tslint:disable-next-line:interface-name
export interface ICandidate {
    ready(): Promise<boolean>;
    initialize(symbols: Symbols): Promise<void>;
    runCase(input: string): Promise<boolean | string>;

    // TODO: ISSUE: should training cases be passed one-by-one or in a batch?
    // trainingCase(input: string, expected: boolean | string): void;

    shutdown(): Promise<void>;
}
