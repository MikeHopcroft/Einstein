const base32 = require('base32') as IBase32;

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
const runs = 'runs';
const suites = 'suites';

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
export function encodeRun(uid: string): string {
    return `/${runs}/${uid}`
}

export function encodeLog(name: string): string {
    return `/logs/${name}`;
}

// NOTE: run encoding differs from benchmarks, candidates, and suites.
export function decodeRun(encoded: string): string {
    const parts = encoded.split('/');
    if (parts.length === 3) {
        return parts[1];
    } else {
        const message = `decode: invalid encoding "${encoded}"`;
        throw new TypeError(message);
    }
}

function encode(collection: string, name: string) {
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

const prefixes: Array<[string, string]> = [
    ['benchmarks', '/benchmarks'],
    ['candidates', '/candidates'],
    ['suites', '/suites'],
    ['runs', '/runs'],
]

const collectionToPrefix = new Map<string, string>(prefixes);
// const prefixToCollection = new Map<string, string>(
//     prefixes.map(x => [x[1], x[0]])
// );

export function getPrefix(collection: string): string {
    const prefix = collectionToPrefix.get(collection);
    if (prefix === undefined) {
        const message = `Bad collection "${collection}"`;
        throw new TypeError(message);
    }
    return prefix;
    // switch (collection) {
    //     case 'benchmarks':
    //         return '/benchmarks';
    //     case 'candidates':
    //         return '/candidates';
    //     case 'suites':
    //         return '/suites';
    //     case 'runs':
    //         return '/runs';
    //     default:
    //         const message = `Bad collection "${collection}"`;
    //         throw new TypeError(message);
    // }
}

export function getCollection(blob: string): string | null {
    for (const [collection, prefix] of collectionToPrefix) {
        if (blob.startsWith(prefix)) {
            return collection;
        }
    }
    return null;
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

