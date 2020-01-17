import * as yaml from 'js-yaml';

import { IStorage } from '../cloud';

import {
    BenchmarkDescription,
    CandidateDescription,
    RunDescription,
    SuiteDescription
} from '../laboratory';

import { getPrefix } from '../naming';
import { formatTable, ContainerImage } from '../utilities';

export async function listCommandInternal(
    storage: IStorage,
    collection: string
): Promise<number> {
    //
    // Currently implemented directly on the cloud IStorage.
    // Intention is to implement via RPC to Repository service.
    //
    const prefix = getPrefix(collection);
    const blobs = await storage.listBlobs(prefix);
    
    const formatter = createFormatter(collection);

    for (const blob of blobs) {
        const buffer = await storage.readBlob(blob);
        const yamlText = buffer.toString('utf8');
        formatter.formatBlob(yamlText);
    }

    for (const line of formatTable(formatter.alignments, formatter.rows)) {
        console.log(line);
    }

    return 0;
}

// tslint:disable-next-line:interface-name
interface IFormatter {
    alignments: string[];
    rows: string[][];
    formatBlob(yamlText: string): void;
}

class BenchmarkFormatter implements IFormatter {
    alignments = ['left', 'left', 'left', 'left'];
    private headers = ['image', 'name', 'owner', 'created'];
    rows: string[][] = [this.headers];

    formatBlob(yamlText: string): void {
        const item = yaml.safeLoad(yamlText) as BenchmarkDescription;

        const image = new ContainerImage(item.image);
        const tag = `${image.component}:${image.tag}`;

        this.rows.push([tag, item.name, item.owner, item.created]);
    }
}

class CandidateFormatter implements IFormatter {
    alignments = ['left', 'left', 'left', 'left'];
    private headers = ['image', 'name', 'owner', 'created'];
    rows: string[][] = [this.headers];

    formatBlob(yamlText: string): void {
        const item = yaml.safeLoad(yamlText) as CandidateDescription;

        const image = new ContainerImage(item.image);
        const tag = `${image.component}:${image.tag}`;

        this.rows.push([tag, item.name, item.owner, item.created]);
    }
}

class SuiteFormatter implements IFormatter {
    alignments = ['left', 'left', 'left', 'left'];
    private headers = ['name', 'benchmark', 'owner', 'created'];
    rows: string[][] = [this.headers];

    formatBlob(yamlText: string): void {
        const item = yaml.safeLoad(yamlText) as SuiteDescription;

        this.rows.push([item.name, item.benchmarkId, item.owner, item.created]);
    }
}

class RunFormatter implements IFormatter {
    alignments = ['left', 'left', 'left', 'left', 'left'];
    private headers = ['name', 'candidate', 'benchmark', 'suite', 'date'];
    rows: string[][] = [this.headers];

    formatBlob(yamlText: string): void {
        const item = yaml.safeLoad(yamlText) as RunDescription;

        this.rows.push([item.runId, item.candidateId, item.benchmarkId, item.suiteId, item.created]);
    }
}

function createFormatter(collection: string): IFormatter {
    switch (collection) {
        case 'benchmarks':
            return new BenchmarkFormatter();
        case 'candidates':
            return new CandidateFormatter();
        case 'suites':
            return new SuiteFormatter();
        case 'runs':
            return new RunFormatter();
        default:
            const message = `Bad collection "${collection}"`;
            throw TypeError(message);
    }
}
