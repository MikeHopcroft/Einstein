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
    EntityDescription,
    LaboratoryDescription,
    RunDescription,
    SuiteDescription,
    AnyDescription,
    Kind
} from './interfaces';

import { validateAsAnyDescription } from './schemas';

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

export async function loadLaboratory(
    name: string,
    storage: IStorage
): Promise<LaboratoryDescription> {
    const buffer = await storage.readBlob(name);
    const yamlText = buffer.toString('utf8');
    const data = yaml.safeLoad(yamlText) as LaboratoryDescription;
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

///////////////////////////////////////////////////////////////////////////////

export async function loadEntity(
    name: string,
    storage: IStorage,
    encodeName = true
): Promise<AnyDescription> {
    const encoded = encodeName ? encodeSuite(name): name;
    const buffer = await storage.readBlob(encoded);
    const yamlText = buffer.toString('utf8');
    const data = yaml.safeLoad(yamlText);

    return validateAsAnyDescription(data);
}

export function toBenchmark(
    description: AnyDescription
): BenchmarkDescription {
    if (description.kind !== Kind.BENCHMARK) {
        const message = `toBenchmark(): expected kind==="${
            Kind.BENCHMARK}", found "${description.kind}"`;
        throw new TypeError(message);
    }

    return description;    
}

export function toCandidate(
    description: AnyDescription
): CandidateDescription {
    if (description.kind !== Kind.CANDIDATE) {
        const message = `toCandidate(): expected kind==="${
            Kind.CANDIDATE}", found "${description.kind}"`;
        throw new TypeError(message);
    }

    return description;    
}

export function toRun(
    description: AnyDescription
): RunDescription {
    if (description.kind !== Kind.RUN) {
        const message = `toRun(): expected kind==="${
            Kind.RUN}", found "${description.kind}"`;
        throw new TypeError(message);
    }

    return description;    
}

export function toSuite(
    description: AnyDescription
): SuiteDescription {
    if (description.kind !== Kind.SUITE) {
        const message = `toSuite(): expected kind==="${
            Kind.SUITE}", found "${description.kind}"`;
        throw new TypeError(message);
    }

    return description;    
}

