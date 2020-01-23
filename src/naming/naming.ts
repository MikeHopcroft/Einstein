const base32 = require('base32') as IBase32;
import { v3 } from 'murmurhash';
import * as uuid from 'uuid';

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

// Murmurhash seed.
const seed = 1234567;

export function createRunId(): string {
    const id = uuid();
    const hashed = v3(id, seed);
    return hashed.toString();
}

export function encodeBenchmark(name: string): string {
    return encode(benchmarks, name)
}

export function decodeBenchmark(encoded: string): string {
    return decode(benchmarks, encoded);
}

export function encodeCandidate(name: string): string {
    return encode(candidates, name)
}

export function decodeCandidate(encoded: string): string {
    return decode(candidates, encoded);
}

export function encodeSuite(name: string): string {
    return encode(suites, name)
}

export function decodeSuite(encoded: string): string {
    return decode(suites, encoded);
}

// NOTE: run encoding differs from benchmarks, candidates, and suites.
// Does not base32 encode uid.
// TODO: still need to protect from injection attacks.
export function encodeRun(uid: string): string {
    return `/${runs}/${uid}`
}

// NOTE: log encoding differs from benchmarks, candidates, and suites.
// Does not base32 encode name.
export function encodeLog(name: string): string {
    return `/${logs}/${name}`;
}

function encode(collection: string, name: string) {
    // TODO: verify collection is valid.
    return `/${collection}/${base32.encode(name)}`;
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

export function getPrefix(collection: string): string {
    const prefix = collectionToPrefix.get(collection);
    if (prefix === undefined) {
        const message = `Bad collection "${collection}"`;
        throw new TypeError(message);
    }
    return prefix;
}

export function getCollection(blob: string): string | null {
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

