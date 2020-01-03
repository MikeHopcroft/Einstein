# TODO LIST

## Housekeeping
* Remove Windows paths from true_or_false sample
* Duplicate definitions for SymbolTable
* Set formatting properties for VS Code
* Travis
* Prettier clean
* x Move localWorker, localOrchestrator, ramDisk to local directory.
* Prototype GRPC build with static stub generation
* Prototype multi-language build
* Prototype container build

## Other
* x LocalWorker.shutdown()
* x sleep() to utilities
* Suite upload utility methods

## Sample Benchmark and Candidate
* Naming utilities
    * UUID generation - https://www.npmjs.com/package/uuid
* Secrets
    * Encryption algorithm
* Cloud abstraction layer: in-memory storage emulator
    * Copy from file system
    * List blobs matching prefix
    * Read blob
    * Create blob
    * IStorage blob creation/deletion/update events
    * IStorage from Volume[]
    * IStorage blob metadata (e.g. creation date, size, owner)
* gRPC prototype
* Calculator Benchmark - verify answer
    * Schema verification
    * Implement on IWorker
    * Error handling for async APIs
    * Compute measures
    * Write results
    * Suite 1 - add, subtract, multiply
    * Suite 2 - parentheses, variables
    * Benchmark application
* Calculator Benchmark 2 - verify parse tree
* Calculator Candidate
    * Schema verification
    * Implement on IWorker
    * Fixed point
    * Floating point
    * Typescript version
    * Python version
* Factor out candidate skeleton

## Laboratory Service - Configuration
* Upload benchmark
* Upload suite
* Upload candidate
* RESTful API to list candidates, benchmarks, suites, etc.

## CLI - Configuration
* Deploy
* Encrypt
* Upload benchmark
* Upload suite
* Upload candidate
* List candidates, benchmarks, suites, etc.

## Laboratory Service - Running Tests
* Cloud abstraction layer: Docker orchestrator
* Run (candidate, suite)

## CLI - Running Tests
* Run (candidate, suite)
