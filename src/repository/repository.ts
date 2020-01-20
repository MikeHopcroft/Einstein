import {
    IDatabase,
    IWorker,
    LocalDatabase,
    World,
} from '../cloud';

import { IRepository, SelectResults } from './interfaces';
import { getCollection } from '../naming';
import { loadBenchmark, BenchmarkDescription } from '../laboratory';

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
            // const collection = getCollection(blob);
            // switch (collection) {
            //     case 'benchmarks':
            //         await this.processBenchmark(blob);
            //         break;
            //     case 'candidates':
            //         await this.processCandidate(blob);
            //         break;
            //     case 'suites':
            //         await this.processSuite(blob);
            //         break;
            //     case 'runs':
            //         await this.processRun(blob);
            //         break;
            //     default:
            //         // This blob is not a member of a collection
            //         // that we process. Skip it.
            // }
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

    private async processRun(name: string) {
        // If runs table, add to runs table
        // Otherwise, add to orphan's table

        // Adding to table involves pulling fields from run,
        // based on column schema in benchmark.

        // // Ensure results table for this benchmark.
        // // TODO: get results column schema from benchmark YAML file
        // const columns = [
        //     { name: 'candidate', type: 'string' },
        //     { name: 'suite', type: 'string' },
        //     { name: 'date', type: 'string' },
        //     { name: 'passed', type: 'string' },
        //     { name: 'failed', type: 'string' },
        // ];
        // await this.database.ensureTable(
        //     benchmark.image,

        // // Process orphaned runs associated with this benchmark.
    }

    private async processSuite(name: string) {
        // Ensure suites table.
        // Add to suites table.
    }

    private async processCandidate(name: string) {
        // Ensure candidates table.
        // Add to candidates table.
    }
}
