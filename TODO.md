# TODO LIST

## Housekeeping
* Applications go in src/applications
* Remove Windows paths from true_or_false sample
* Move sample code out to samples folder
* Set up unit testing
* Duplicate definitions for SymbolTable
* Set formatting properties for VS Code
* Travis
* Prettier clean
* x Move localWorker, localOrchestrator, ramDisk to local directory.
* Prototype GRPC build with static stub generation
* Prototype multi-language build
* Prototype container build

## Other
* Convert CLIArgs class to CLIMain() function
* CLI connection to labratory based on configuration file
* Verfiy localDisk and ls work on Windows
* Better handling of timeouts - e.g. einstein deploy
* Shell: exit command instead of blank line
* Shell: help command
* Shell: suppress dot commands?
* Catch errors in shell (e.g. duplicate deployments)
* Docker image parser - https://stackoverflow.com/questions/37861791/how-are-docker-image-names-parsed
* x Shell: cd command - proper path joining
* Shell: better arg splitter that handles quotes. https://stackoverflow.com/questions/2817646/javascript-split-string-on-space-or-on-quotes-to-array/18647776
* x Shell: figure out how to get cwd into prompt
* localDisk: handle ~ in root path
* localDisk: unit tests
* localDisk: ensure paths exist on file create
* IStorage: change listBlobs API to distinguish between path not found and empty directory.

* IStorge:listBlobs needs to be consistent across localDisk and ramDisks
* Naming library and loader
* IStorage from Volume[]
* Disk based IStorage
* Wildcard matching
* x Deal with the two Image classes.
* Logging
* Schema verify after all yaml loads.
* Better ajv errors.
* Error check FooDescription name fields. Need to be legal in blob names.
* x LocalWorker.shutdown()
* x sleep() to utilities
* Suite upload utility methods
* Cloud storage mechanism to prevent blob overwrite - https://stackoverflow.com/questions/47716780/dont-overwrite-azure-blob-storage

## Sample Benchmark and Candidate
* Naming utilities
    * UUID generation - https://www.npmjs.com/package/uuid
    * CandidateDescription => blob path
    * BenchmarkDescription => blob path
* Secrets
    * x Encryption algorithm
    * Move sample out of library
    * Unit tests
* Cloud abstraction layer: in-memory storage emulator
    * Copy from file system
    * x List blobs matching prefix
    * x Read blob
    * x Create blob
    * IStorage blob creation/deletion/update events
    * IStorage from Volume[]
    * IStorage blob metadata (e.g. creation date, size, owner)
* gRPC prototype
* True_Or_False Benchmark - verify answer
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
* . Upload candidate
* RESTful API to list candidates, benchmarks, suites, etc?

## REPL
* Sets up environment
* Sends commands to CLI
* ls command (files and blobs)
* more command
* list containers running

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
