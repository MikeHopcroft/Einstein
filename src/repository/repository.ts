import {
    IDatabase,
    IWorker,
    LocalDatabase,
    World,
    ColumnDescription,
} from '../cloud';

import { IRepository, SelectResults } from './interfaces';
import { getCollection, encodeBenchmark } from '../naming';
import {
    loadBenchmark,
    loadCandidate,
    BenchmarkDescription,
    loadRun,
    loadSuite
} from '../laboratory';

// TODO: get these from the naming library.
const benchmarkTableName = 'benchmarks';
const candidateTableName = 'candidates';
const runTableName = 'runs';
const suiteTableName = 'suites';


const benchmarkColumns: ColumnDescription[] = [
    { name: 'image', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'owner', type: 'string' },
    { name: 'created', type: 'string' },
];

const candidateColumns: ColumnDescription[] = [
    { name: 'image', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'owner', type: 'string' },
    { name: 'created', type: 'string' },
];

const runColumns: ColumnDescription[] = [
    { name: 'name', type: 'string' },
    { name: 'candidateId', type: 'string' },
    { name: 'benchmarkId', type: 'string' },
    { name: 'suiteId', type: 'string' },
    { name: 'created', type: 'string' },
];

const suiteColumns: ColumnDescription[] = [
    { name: 'name', type: 'string' },
    { name: 'benchmarkId', type: 'string' },
    { name: 'owner', type: 'string' },
    { name: 'created', type: 'string' },
];

export class Repository implements IRepository {
    static getPort() {
        // TODO: don't hard-code port here.
        return 8080;
    }

    static image = {
        tag: 'repository:1.0',
        create: () => Repository.entryPoint
    };

    // TODO: this should do a bind, not a connect.
    static async entryPoint(worker: IWorker) {
        worker.log(`Repository.entryPoint()`);


        // Construct and bind service RPC stub. 
        const world = worker.getWorld();
        const myService = new Repository(world);

        const port = Repository.getPort();
        worker.bind(worker.getWorld(), myService, port);

        worker.log(`Repository service running at ${world.hostname}:${port}`);
    }

    database: IDatabase;
    world: World;

    // DESIGN NOTE: Cache prevents multiple loads of the same benchmark, while
    // processing runs. WARNING: Assumes that benchmarks are immutable.
    private benchmarkCache = new Map<string, BenchmarkDescription>();

    constructor(world: World) {
        this.database = new LocalDatabase();
        this.world = world;
    }

    async select(from: string): Promise<SelectResults> {
        const columns = await this.database.getColumns(from);
        const rows = await this.database.select(from);
        return { columns, rows };
    }

    // TODO: container instantiation requires differentation between invoking
    // the class constructor and its initialization method. Initialization may
    // require async calls.
    async initialize(): Promise<void> {
        // DESIGN NOTE: Have to assume that blob creation events could arrive
        // out of order.

        // Alias 'this' for use in anonymous function.
        const repository = this;

        // Bind to cloud storage events before starting crawl.
        // This ensures that no blob will be missed.
        this.world.cloudStorage.onBlobCreate(async (blob: string) => {
            // console.log(`onBlobCreate(${blob})`);
            // TODO: REVIEW: do we really want to await here?
            await repository.processOneBlob(blob);
        });

        // Crawl blobs
        // TODO: REVIEW: do we really want to await here?
        await this.crawlBlobs();
    }

    private async crawlBlobs() {
        // console.log('repository: beginning crawl')
        const cloudStorage = this.world.cloudStorage;
        const blobs = await cloudStorage.listBlobs();
        for (const blob of blobs) {
            this.processOneBlob(blob);
        }
    }

    private async processOneBlob(blob: string): Promise<void> {
        const collection = getCollection(blob);
        switch (collection) {
            case 'benchmarks':
                await this.processBenchmark(blob);
                break;
            case 'candidates':
                await this.processCandidate(blob);
                break;
            case 'suites':
                await this.processSuite(blob);
                break;
            case 'runs':
                await this.processRun(blob);
                break;
            default:
                // This blob is not a member of a collection
                // that we process. Skip it.
        }
    }

    // TODO: REVIEW: this never allows for benchmark updates. Is this ok?
    private async getBenchmark(blob: string): Promise<BenchmarkDescription> {
        let benchmark = this.benchmarkCache.get(blob);
        if (benchmark === undefined) {
            benchmark = await loadBenchmark(blob, this.world.cloudStorage, false);
            this.benchmarkCache.set(blob, benchmark);
        }
        return benchmark;
    }

    private async processBenchmark(blob: string) {
        console.log(`repository: processBenchmark ${blob}`);
        const benchmark = await this.getBenchmark(blob);

        // Ensure benchmarks table.
        await this.database.ensureTable(
            benchmarkTableName,
            benchmarkColumns
        );

        // Add to benchmarks table.
        // TODO: uniqueness constraint ensures that only first instance of
        // benchmark is added. Could get one from the crawl and another from
        // a blob creation event.
        this.addRow(benchmarkTableName, benchmarkColumns, benchmark);
    }

    private async processCandidate(blob: string) {
        console.log(`repository: processCandidate ${blob}`);
        const candidate = await loadCandidate(blob, this.world.cloudStorage, false);

        // Ensure suites table.
        await this.database.ensureTable(candidateTableName, candidateColumns);

        // Add to suites table.
        // TODO: uniqueness constraint ensures that only first instance of
        // benchmark is added. Could get one from the crawl and another from
        // a blob creation event.
        this.addRow(candidateTableName, candidateColumns, candidate);
    }

    private async processRun(blob: string) {
        console.log(`repository: processRun ${blob}`);
        const run = await loadRun(blob, this.world.cloudStorage, false);
        const benchmarkId = run.benchmarkId;
        const benchmarkBlob = encodeBenchmark(benchmarkId);
        console.log(`Run ${run.name}: benchmarkId: ${benchmarkId}`);
        const benchmark = await this.getBenchmark(benchmarkBlob);

        // TODO: add to runs table.

        // Ensure results table.
        await this.database.ensureTable(benchmarkId, benchmark.columns);

        this.addRow(benchmarkId, benchmark.columns, run);
    }

    private async addRow(
        table: string,
        columns: ColumnDescription[],
        // tslint:disable-next-line:no-any
        results: any   
    ): Promise<void> {
        // Copy results to results table.
        // const row = {};
        // tslint:disable-next-line:no-any
        const row: any[] = [];
        for (const column of columns) {
            const value = 
                // tslint:disable-next-line:no-any
                (results.data && (results.data as any)[column.name]) ||
                results[column.name];

            if (value !== undefined) {
                // // tslint:disable-next-line:no-any
                // (row as any)[column.name] = value;
                row.push(value);
            } else {
                const message = `Expected field "${column.name}"`;
                throw new TypeError(message);
            }
        }

        this.database.insert(table, row);
    }

    private async processSuite(blob: string) {
        console.log(`repository: processSuite ${blob}`);
        const suite = await loadSuite(blob, this.world.cloudStorage, false);

        // Ensure suites table.
        await this.database.ensureTable(suiteTableName, suiteColumns);

        // Add to suites table.
        // TODO: uniqueness constraint ensures that only first instance of
        // benchmark is added. Could get one from the crawl and another from
        // a blob creation event.
        this.addRow(suiteTableName, suiteColumns, suite);
    }
}
