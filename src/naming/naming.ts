const base32 = require('base32') as IBase32;

// tslint:disable-next-line:interface-name
interface IBase32 {
    encode(text:string): string;
    decode(text:string): string;
}

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

export function getPrefix(collection: string): string {
    switch (collection) {
        case 'benchmarks':
            return '/benchmarks';
        case 'candidates':
            return '/candidates';
        case 'suites':
            return '/suites';
        case 'runs':
            return '/runs';
        default:
            const message = `Bad collection "${collection}"`;
            throw new TypeError(message);
    }
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

