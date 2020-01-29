import {
    IDatabase,
    IWorker,
    LocalDatabase,
    World,
    ColumnDescription,
} from '../cloud';

import {
    benchmarkCollection,
    candidateCollection,
    encodeBenchmark,
    getBenchmarkId,
    getCollectionTable,
    getKindFromBlob,
    getResultsTable,
    runCollection,
    suiteCollection
} from '../naming';

import {
    BenchmarkDescription,
    loadBenchmark,
    loadCandidate,
    loadRun,
    loadSuite,
    Kind
} from '../laboratory';

import { sleep } from '../utilities';

import { IRepository, SelectResults } from './interfaces';

//
// Column descriptions for built-in database tables
//
// TODO: perhaps move the ColumnDescriptions to a config file.
//

// const auditColumns: ColumnDescription[] = [
//     { name: 'date', type: 'string' },
//     { name: 'user', type: 'string' },
//     { name: 'action', type: 'string' },
// ];

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
    static image = {
        tag: 'repository:1.0',
        create: () => Repository.entryPoint
    };

    // TODO: this should do a bind, not a connect.
    static async entryPoint(worker: IWorker) {
        worker.log(`Repository.entryPoint()`);

        // Simulate server startup time.
        const startupDelaySeconds = 6;
        worker.log(`sleeping for ${startupDelaySeconds} seconds`);
        await sleep(startupDelaySeconds * 1000);
        worker.log('woke up');

        // Construct and bind service RPC stub. 
        const world = worker.getWorld();
        const myService = new Repository(world);

        // TODO: startup parameter that indicates whether to rebuild the
        // database or connect to an existing one.
        
        // DESIGN NOTE: await is important here because we want to ensure that
        // tables have been created before binding the service.
        await myService.initialize();

        const env =  worker.getWorld().environment;
        // TODO: error check on port number parsing.
        const port = Number(env.get('port'));
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

    async selectFromCollection(collection: string): Promise<SelectResults> {
        const table = getCollectionTable(collection);
        return this.select(table);
    }

    async selectFromResults(benchmarkId: string): Promise<SelectResults> {
        // See if benchmarkId actually corresponds to a benchmark.
        // getBenchmark() will throw if blob doesn't exist.
        // TODO: REVIEW: is this check really necessary? What does it buy us?
        // Perhaps this check is preventing the caller from accessing an
        // arbitrary table whose name has the form produced by getResultsTable().
        const encoded = encodeBenchmark(benchmarkId);
        this.getBenchmark(encoded);

        // If we got this far, benchmarkId is valid, so it is ok to use as a
        // table name.
        const table = getResultsTable(benchmarkId);
        return this.select(table);
    }

    async select(from: string): Promise<SelectResults> {
        try {
            const columns = await this.database.getColumns(from);
            const rows = await this.database.select(from);
            return { columns, rows };
        } catch (e) {
            const message = `Unable to select from ${from}`;
            throw new TypeError(message);
        }
    }

    // TODO: container instantiation requires differentation between invoking
    // the class constructor and its initialization method. Initialization may
    // require async calls.
    async initialize(): Promise<void> {
        this.world.logger.log('Initializing');
        // DESIGN NOTE: Have to assume that blob creation events could arrive
        // out of order.

        // DESIGN NOTE: await is essential here to ensure that tables all exist
        // before initialize() completes and the service binds.
        await this.ensureTables();

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
        this.world.logger.log('Initialization complete');
    }

    // TODO: this can just create, rather than ensure because it now runs in
    // initialize(), before events are wired.
    private async ensureTables(): Promise<void> {
        // Ensure benchmarks table.
        await this.database.ensureTable(
            getCollectionTable(benchmarkCollection),
            benchmarkColumns
        );

        // Ensure candidates table.
        await this.database.ensureTable(
            getCollectionTable(candidateCollection),
            candidateColumns);

        // Ensure runs table.
        await this.database.ensureTable(
            getCollectionTable(runCollection),
            runColumns);

        // Ensure suites table.
        await this.database.ensureTable(
            getCollectionTable(suiteCollection),
            suiteColumns);
    }

    private async crawlBlobs(): Promise<void> {
        // console.log('repository: beginning crawl')
        const cloudStorage = this.world.cloudStorage;
        const blobs = await cloudStorage.listBlobs();
        for (const blob of blobs) {
            this.processOneBlob(blob);
        }
    }

    private async processOneBlob(blob: string): Promise<void> {
        const kind = getKindFromBlob(blob);
        switch (kind) {
            case Kind.BENCHMARK:
                await this.processBenchmark(blob);
                break;
            case Kind.CANDIDATE:
                await this.processCandidate(blob);
                break;
            case Kind.SUITE:
                await this.processSuite(blob);
                break;
            case Kind.RUN:
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
        this.world.logger.log(`processBenchmark ${blob}`);
        const benchmark = await this.getBenchmark(blob);

        // Add this benchmark to the benchmarks table.
        // TODO: uniqueness constraint must ensure that only first instance of
        // the benchmark is added. Could get one from the crawl and another
        // from a blob creation event.
        const benchmarkTableName = getCollectionTable(benchmarkCollection);
        this.addRow(benchmarkTableName, benchmarkColumns, benchmark);

        // Ensure results table for this benchmark.
        const benchmarkId = getBenchmarkId(benchmark);
        const resultsTable = getResultsTable(benchmarkId);
        await this.database.ensureTable(resultsTable, benchmark.columns);

        // // Ensure results table for this benchmark.
        // const resultsTable = getResultsTable(benchmarkId);
        // await this.database.ensureTable(benchmarkId, benchmark.columns);
    }

    private async processCandidate(blob: string) {
        this.world.logger.log(`processCandidate ${blob}`);
        const candidate = await loadCandidate(blob, this.world.cloudStorage, false);

        // Add to suites table.
        // TODO: uniqueness constraint must ensure that only first instance of
        // the candidate is added. Could get one from the crawl and another from
        // a blob creation event.
        const candidateTableName = getCollectionTable(candidateCollection);
        this.addRow(candidateTableName, candidateColumns, candidate);
    }

    private async processRun(blob: string) {
        this.world.logger.log(`processRun ${blob}`);
        const run = await loadRun(blob, this.world.cloudStorage, false);
        const benchmarkId = run.benchmarkId;
        const benchmarkBlob = encodeBenchmark(benchmarkId);
        // console.log(`Run ${run.name}: benchmarkId: ${benchmarkId}`);
        const benchmark = await this.getBenchmark(benchmarkBlob);

        // Add to runs table.
        this.addRow(
            getCollectionTable(runCollection),
            runColumns,
            run
        );

        // Ensure results table for this benchmark.
        const benchmarkTable = getResultsTable(benchmarkId);
        await this.database.ensureTable(benchmarkTable, benchmark.columns);

        this.addRow(benchmarkTable, benchmark.columns, run);
    }

    private async processSuite(blob: string) {
        this.world.logger.log(`processSuite ${blob}`);
        const suite = await loadSuite(blob, this.world.cloudStorage, false);

        // Add to suites table.
        // TODO: uniqueness constraint ensures that only first instance of
        // benchmark is added. Could get one from the crawl and another from
        // a blob creation event.
        const suiteTableName = getCollectionTable(suiteCollection);
        this.addRow(suiteTableName, suiteColumns, suite);
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
}
