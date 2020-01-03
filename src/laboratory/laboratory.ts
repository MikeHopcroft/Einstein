import * as yaml from 'js-yaml';
import { v3 } from 'murmurhash';
import * as uuid from 'uuid';

import { IStorage, RamDisk } from '../cloud';
import { generateKeys, KeyPair } from '../secrets';

import { CandidateDescription, ILaboratory, UID } from './interfaces';
import murmurhash = require('murmurhash');

const seed = 1234567;

class Laboratory implements ILaboratory {
    private keys: KeyPair;
    private cloudStorage: IStorage;

    constructor(keys: KeyPair, cloudStorage: IStorage) {
        this.keys = keys;
        this.cloudStorage = cloudStorage;
    }

    async getPublicKey(): Promise<string> {
        return this.keys.publicKey;
    }

    async createCandidate(description: CandidateDescription): Promise<UID> {
        // const uid = uuid();
        const containerHash = v3(description.containerBaseName, seed);
        const versionHash = v3(
            `${description.benchmarkId}:${description.containerVersion}`,
            seed
        );
        const blobPath = `candidates/${containerHash}/${versionHash}`;
        // TODO: check for attempt blob overwrite.
        console.log(`Create ${blobPath}`);
        const yamlBuffer = Buffer.from(yaml.safeDump(description), 'utf8');
        this.cloudStorage.writeBlob(blobPath, yamlBuffer);
        return blobPath;
    }

    async listCandidates(pattern: CandidateDescription): Promise<CandidateDescription[]> {
        // TODO: implement wildcard matching
        return [];
    }
}

async function go() {
    const keys = generateKeys();
    const cloudStorage = new RamDisk();
    const lab = new Laboratory(keys, cloudStorage);

    const candidate: CandidateDescription = {
        name: 'Sample True_Or_False Candidate',
        description: 'A sample candidate that implements a boolean expression parser.',
        owner: 'Mike',
        created: new Date().toISOString(),
        benchmarkId: 'true_or_false:1.0.2',
        containerBaseName: 'true_or_false_candidate',
        containerVersion: '1.0'
    };

    await lab.createCandidate(candidate);
}

go();

