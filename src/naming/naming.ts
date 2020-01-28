const base32 = require('base32') as IBase32;
import { v3 } from 'murmurhash';
import * as uuid from 'uuid';

import { AnyDescription, Kind } from '../laboratory';

// base32 packages doesn't have a .d.ts file or an @types/base32
// Define type for package here.
// tslint:disable-next-line:interface-name
interface IBase32 {
    encode(text:string): string;
    decode(text:string): string;
}

// TODO: unify these with the collection/prefix data below.
// Look at declartions for 'prefixes' and 'collectionToPrefix'
const benchmarks = 'benchmarks';
const candidates = 'candidates';
const logs = 'logs';
const runs = 'runs';
const suites = 'suites';

const prefixes: Array<[string, string]> = [
    ['benchmarks', '/benchmarks'],
    ['candidates', '/candidates'],
    ['suites', '/suites'],
    ['runs', '/runs'],
];

const collectionToPrefix = new Map<string, string>(prefixes);

const collectionToTable = new Map<string, string>([
    // ['audits', 'audits'],
    ['benchmarks', 'benchmarks'],
    ['candidates', 'candidates'],
    ['suites', 'suites'],
    ['runs', 'runs'],
]);

const kindToCollection = new Map<Kind, string>([
    [Kind.BENCHMARK, 'benchmarks'],
    [Kind.CANDIDATE, 'candidates'],
    [Kind.LOG, 'logs'],
    [Kind.RUN, 'runs'],
    [Kind.SUITE, 'suites']
]);

// Murmurhash seed.
const seed = 1234567;

export function createRunId(): string {
    const id = uuid();
    const hashed = v3(id, seed);
    return hashed.toString();
}

export function getBlobPath(d: AnyDescription): string {
    switch (d.kind) {
        case Kind.BENCHMARK:
            return encode2(d.kind, d.image);
        case Kind.CANDIDATE:
            return encode2(d.kind, d.image);
        case Kind.SUITE:
            return encode2(d.kind, d.name);
        default:
            const message = `Unsupported kind "${d.kind}"`;
            throw new TypeError(message);
    }
}

export function encodeBenchmark(name: string): string {
    return encode2(Kind.BENCHMARK, name);
}

export function encodeCandidate(name: string): string {
    return encode2(Kind.CANDIDATE, name);
}

export function encodeSuite(name: string): string {
    return encode2(Kind.SUITE, name);
}

// NOTE: run encoding differs from benchmarks, candidates, and suites.
// Does not base32 encode uid.
export function encodeRun(uid: string): string {
    return encode2(Kind.RUN, uid);
    // return `/${getCollection2(Kind.RUN)}/${escapeBlobPath(uid)}`;
}

// NOTE: log encoding differs from benchmarks, candidates, and suites.
// Does not base32 encode name.
export function encodeLog(name: string): string {
    return encode2(Kind.LOG, name);
//    return `/${getCollection2(Kind.LOG)}/${escapeBlobPath(name)}`;
}

function encode2(kind: Kind, name: string) {
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

const maxNameLength = 64;

// This function ensures that a blob path is legal.
// The current implementation does not escape the path.
// It accepts alphanumeric names (upper and lower case)
// length > 0 and length <= maxNameLength. It raises a
// TypeError for non-conforming names.
// https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata
function escapeBlobPath(name: string): string {
    if (name.match(/^[A-Za-z0-9]+$/i) && name.length <= maxNameLength) {
        return name;
    }

    const message = `Invalid name "${name}"`;
    throw new TypeError(message);
}

// function encode(kind: Kind, name: string) {
//     return `/${getCollection2(kind)}/${base32.encode(name)}`;
// }


function getCollectionFromKind(kind: Kind): string {
    const collection = kindToCollection.get(kind);
    if (!collection) {
        const message = `Unknown collection kind "${kind}"`;
        throw new TypeError(message);
    }
    return collection;
}

function decode(collection: string, encoded: string) {
    const parts = encoded.split('/');
    if (parts.length === 3) {
        if (parts[1] === collection) {
            return base32.decode(parts[2]);
        } else {
            const message = `decode: collection mismatch - found "${parts[1]} - expected ${collection}"`;
            throw new TypeError(message);
        }
    } else {
        const message = `decode: invalid encoding "${encoded}"`;
        throw new TypeError(message);
    }
}

// export function getPrefix(collection: string): string {
//     const prefix = collectionToPrefix.get(collection);
//     if (prefix === undefined) {
//         const message = `Bad collection "${collection}"`;
//         throw new TypeError(message);
//     }
//     return prefix;
// }

export function getCollectionFromBlob(blob: string): string | null {
    for (const [collection, prefix] of collectionToPrefix) {
        if (blob.startsWith(prefix)) {
            return collection;
        }
    }
    return null;
}

export function getCollectionTable(collection: string): string {
    const table = collectionToTable.get(collection);
    if (table === undefined) {
        const message = `Collection "${collection}" is not associated with a table`;
        throw new TypeError(message);
    }
    return table;
}

export function getResultsTable(benchmarkId: string): string {
    // TODO: REVIEW: WARNING: assumes at entry that benchmarkId is valid.
    // Consider SQL-escaping, blob-name escaping.
    // Consider looking up benchmarkId in database table.
    return benchmarkId;
}


// Save for unit tests
// console.log(encodeBenchmark('foobar'));
// console.log(decodeBenchmark(encodeBenchmark('foobar')));

// console.log(encodeCandidate('foobar'));
// console.log(encodeCandidate(encodeCandidate('foobar')));

// console.log(encodeSuite('foobar'));
// console.log(decodeSuite(encodeSuite('foobar')));

// console.log(encodeRun('foobar'));
// console.log(decodeRun(encodeRun('foobar')));

