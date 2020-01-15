import * as yaml from 'js-yaml';

import { IStorage } from '../cloud';

import {
    encodeBenchmark,
    encodeCandidate,
    encodeRun,
    encodeSuite
} from '../naming';

import {
    BenchmarkDescription,
    CandidateDescription,
    RunDescription,
    SuiteDescription
} from './interfaces';

export async function loadBenchmark(
    name: string,
    storage: IStorage,
    encodeName = true
): Promise<BenchmarkDescription> {
    const encoded = encodeName ? encodeBenchmark(name) : name;
    const buffer = await storage.readBlob(encoded);
    const yamlText = buffer.toString('utf8');
    const data = yaml.safeLoad(yamlText) as BenchmarkDescription;
    return data;
}

export async function loadCandidate(
    name: string,
    storage: IStorage,
    encodeName = true
): Promise<CandidateDescription> {
    const encoded = encodeName ? encodeCandidate(name) : name;
    const buffer = await storage.readBlob(encoded);
    const yamlText = buffer.toString('utf8');
    const data = yaml.safeLoad(yamlText) as CandidateDescription;
    return data;
}

export async function loadRun(
    name: string,
    storage: IStorage,
    encodeName = true
): Promise<RunDescription> {
    const encoded = encodeName ? encodeRun(name) : name;
    const buffer = await storage.readBlob(encoded);
    const yamlText = buffer.toString('utf8');
    const data = yaml.safeLoad(yamlText) as RunDescription;
    return data;
}

export async function loadSuite(
    name: string,
    storage: IStorage,
    encodeName = true
): Promise<SuiteDescription> {
    const encoded = encodeName ? encodeSuite(name): name;
    const buffer = await storage.readBlob(encoded);
    const yamlText = buffer.toString('utf8');
    const data = yaml.safeLoad(yamlText) as SuiteDescription;
    return data;
}
