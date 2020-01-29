const base32 = require('base32') as IBase32;
import { v3 } from 'murmurhash';
import * as uuid from 'uuid';

import { AnyDescription, Kind, BenchmarkDescription } from '../laboratory';

// base32 package doesn't have a .d.ts file or an @types/base32
// Define type for package here.
// tslint:disable-next-line:interface-name
interface IBase32 {
    encode(text:string): string;
    decode(text:string): string;
}

// Constants for collection names used in "einstein list [collection]".
// TODO: export const auditCollection = 'audits';
export const benchmarkCollection = 'benchmarks';
export const candidateCollection = 'candidates';
export const logCollection = 'logs';
export const runCollection = 'runs';
export const suiteCollection = 'suites';

// Table names associated with collections.
const benchmarkTable = 'benchmarks';
const candidateTable = 'candidates';
const runTable = 'runs';
const suiteTable = 'suites';

// Maps collection name, used in "einstein list [collection]" to database
// table name.
//
// DESIGN NOTE: table names for built-in collections must not be allowed to
// collide with results table names. Currently the results table name is the
// benchmarkID of the run's Benchmark.
//
// ISSUE: should this live in the naming library, or is it really the internal
// workings of the repository service?
const collectionToTable = new Map<string, string>([
    // TODO: ['audits', 'audits'],
    [benchmarkCollection, benchmarkTable],
    [candidateCollection, candidateTable],
    [runCollection, runTable],
    [suiteCollection, suiteTable],
]);

// Maps a Kind to its associated collection name. Collection names can be used
// to determine blob path prefixes and table names.
const kindToCollection = new Map<Kind, string>([
    [Kind.BENCHMARK, benchmarkCollection],
    [Kind.CANDIDATE, candidateCollection],
    [Kind.LOG, logCollection],
    [Kind.SUITE, suiteCollection],
    [Kind.RUN, runCollection],
]);

// Maps a Kind to the blob path prefix for the Kind.
// Convention in this code is that a blob path prefix is just a '/', followed
// by the Kind's collection name.
const kindToPrefix = new Map<Kind, string>(
    Array.from(kindToCollection.entries(), ([key, value]) => {
        return [key, '/' + value] as [Kind, string];
    })
);

// Murmurhash seed.
const seed = 1234567;

export function createRunId(): string {
    // Create unique identifier.
    const id = uuid();

    // Hash it to make the value shorter and all numeric.
    const hashed = v3(id, seed);
    return hashed.toString();
}

// Returns the hostname for the Benchmark instance associated with the
// specified runId.
export function getBenchmarkHost(runId: string) {
    return 'b' + runId;
}

// Returns the hostname for the Candidate instance associated with the
// specified runId.
export function getCandidateHost(runId: string) {
    return 'c' + runId;
}

// Returns the benchmarkId derived from a specified BenchmarkSpec.
// Convention is to use the container image for the id.
// TODO: REVIEW: is it a good idea to use the container image?
export function getBenchmarkId(benchmark: BenchmarkDescription) {
    return benchmark.image;
}

// Returns the blob path (or key) associated with a Specification.
export function getBlobPath(d: AnyDescription): string {
    switch (d.kind) {
        case Kind.BENCHMARK:
            return encode(d.kind, getBenchmarkId(d));
        case Kind.CANDIDATE:
            return encode(d.kind, d.image);
        case Kind.SUITE:
            return encode(d.kind, d.name);
        default:
            const message = `Unsupported kind "${d.kind}"`;
            throw new TypeError(message);
    }
}

// Returns the blob path associated with a specified benchmarkId.
// Does not verify that the benchmarkId is known to the system.
export function encodeBenchmark(benchmarkId: string): string {
    return encode(Kind.BENCHMARK, benchmarkId);
}

// Returns the blob path associated with a specified candidateId.
// Does not verify that the candidateId is known to the system.
export function encodeCandidate(candidateId: string): string {
    return encode(Kind.CANDIDATE, candidateId);
}

// Returns the blob path associated with a specified suiteId.
// Does not verify that the suiteId is known to the system.
export function encodeSuite(suiteId: string): string {
    return encode(Kind.SUITE, suiteId);
}

// Returns the blob path associated with a specified runId.
// Does not verify that the runId is known to the system.
export function encodeRun(uid: string): string {
    return encode(Kind.RUN, 'r' + uid);
}

// Returns the blob path for logging from specified host.
export function encodeLog(hostname: string): string {
    return encode(Kind.LOG, hostname);
}

function encode(kind: Kind, name: string) {
    const collection = getCollectionFromKind(kind);

    switch (kind) {
        case Kind.BENCHMARK:
        case Kind.CANDIDATE:
        case Kind.SUITE:
            return `/${collection}/${base32.encode(name)}`;
        case Kind.RUN:
        case Kind.LOG:
            return `/${collection}/${escapeBlobPath(name)}`;
        default:
            const message = `Unsupported kind "${kind}"`;
            throw new TypeError(message);
    }
}


// This function ensures that a blob path is legal.
// The current implementation does not escape the path.
// It accepts alphanumeric names (upper and lower case)
// length > 0 and length <= maxNameLength. It raises a
// TypeError for non-conforming names.
// https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata
// https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
const maxNameLength = 64;
function escapeBlobPath(name: string): string {
    if (name.match(/^[A-Za-z0-9]+$/i) && name.length <= maxNameLength) {
        return name;
    }

    const message = `Invalid name "${name}"`;
    throw new TypeError(message);
}

// TODO: REVIEW: this function seems to exist solely to throw an exception.
// Should it be moved into its sole caller?
function getCollectionFromKind(kind: Kind): string {
    const collection = kindToCollection.get(kind);
    if (!collection) {
        const message = `Unknown collection kind "${kind}"`;
        throw new TypeError(message);
    }
    return collection;
}

// Returns the Kind based on the prefix of a blob's path, or null if the
// prefix doesn't match any Kind values associated with prefixes.
export function getKindFromBlob(blob: string): Kind | null {
    for (const [kind, prefix] of kindToPrefix) {
        if (blob.startsWith(prefix)) {
            return kind;
        }
    }
    return null;
}

// Returns the collection table name associated with a collection name.
// Does not verify that the table exists.
//
// DESIGN NOTE: table names for built-in collections must not be allowed to
// collide with results table names. Currently the results table name is the
// benchmarkID of the run's Benchmark.
export function getCollectionTable(collection: string): string {
    const table = collectionToTable.get(collection);
    if (table === undefined) {
        const message = `Collection "${collection}" is not associated with a table`;
        throw new TypeError(message);
    }
    return table;
}

// Returns the results table name associated with a benchmarkId.
// Does not verify that the table exists.
// Does not check whether benchmarkId is known to the system.
//
// DESIGN NOTE: table names for built-in collections must not be allowed to
// collide with results table names. Currently the results table name is the
// benchmarkID of the run's Benchmark.
export function getResultsTable(benchmarkId: string): string {
    // TODO: REVIEW: WARNING: does not check whether benchmarkId is known to
    // the system.
    return 'results/' + base32.encode(benchmarkId);
}
