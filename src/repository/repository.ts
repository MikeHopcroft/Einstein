import {
    IDatabase,
    IWorker,
    LocalDatabase,
    World,
} from '../cloud';

import { IRepository, SelectResults } from './interfaces';
import { getCollection, encodeBenchmark } from '../naming';
import { loadBenchmark, BenchmarkDescription, loadRun } from '../laboratory';

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

    constructor(world: World) {
        this.database = new LocalDatabase();
        this.world = world;

        // Bind to cloud storage events here?
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
        // TODO: decide where to create tables. ISSUE is that a blob
        // change event could come in before the tables are set up.
        // e.g. suppose a run for a benchmark comes in before the results
        // table for that benchmark exists.
        // Have to assume that blob events could arrive out of order.

        const repository = this;

        // Bind to cloud storage events here?
        this.world.cloudStorage.onBlobCreate(async (blob: string) => {
            console.log(`onBlobCreate(${blob})`);
            await repository.processOneBlob(blob);
        });

        // Crawl blobs
        await this.crawlBlobs();
    }

    private async crawlBlobs() {
        console.log('repository: beginning crawl')
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

    private benchmarkTableName = 'benchmarks';
    private benchmarkCache = new Map<string, BenchmarkDescription>();

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
            this.benchmarkTableName,
            [
                { name: 'image', type: 'string' },
                { name: 'name', type: 'string' },
                { name: 'owner', type: 'string' },
                { name: 'created', type: 'string' },
            ]
        );

        // Add to benchmarks table.
        // TODO: uniqueness constraint ensures that only first instance of
        // benchmark is added. Could get one from the crawl and another from
        // a blob creation event.
        await this.database.insert(
            this.benchmarkTableName,
            [
                benchmark.image,
                benchmark.name,
                benchmark.owner,
                benchmark.created
            ]
        );
    }

    private async processRun(blob: string) {
        console.log(`repository: processRun ${blob}`);
        const run = await loadRun(blob, this.world.cloudStorage, false);
        const benchmarkId = run.benchmarkId;
        const benchmarkBlob = encodeBenchmark(benchmarkId);
        console.log(`Run ${run.name}: benchmarkId: ${benchmarkId}`);
        const benchmark = await this.getBenchmark(benchmarkBlob);

        // Ensure results table.
        await this.database.ensureTable(
            benchmarkId,
            benchmark.columns
        );

        // Copy results to results table.
        // const row = {};
        // tslint:disable-next-line:no-any
        const row: any[] = [];
        for (const column of benchmark.columns) {
            const value = 
                // tslint:disable-next-line:no-any
                (run.data as any)[column.name] ||
                // tslint:disable-next-line:no-any
                (run as any)[column.name];

            if (value !== undefined) {
                // // tslint:disable-next-line:no-any
                // (row as any)[column.name] = value;
                row.push(value);
            } else {
                const message = `Expected field "${column.name}"`;
                throw new TypeError(message);
            }
        }

        await this.database.insert(benchmarkId, row);
    }

    private async processSuite(blob: string) {
        console.log(`repository: processSuite ${blob}`);
        // Ensure suites table.
        // Add to suites table.
    }

    private async processCandidate(blob: string) {
        console.log(`repository: processCandidate ${blob}`);
        // Ensure candidates table.
        // Add to candidates table.
    }
}
