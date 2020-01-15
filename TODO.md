# TODO LIST

## Next
* x Logging
* x cloud more
* einstein create gets type from yaml
* einstein create vm
* Set up unit testing

## Housekeeping
* Improve top-level README.md
* Bring over architectural documents
* Set up formatting properties for VS Code
* Set up Travis
* Prettier clean

## Easy
* BUG: `einstein deploy` should not work without a host parameter.
* x getPrefix() should move to naming.ts
* Cloud commands (ls, more) should not be relative to filesystem cwd
* Shell print list of commands
* world.ts: suppress localStorage initialization on disk.
* Remove dead code files and debug configurations
  * x junk2.ts
  * x shell.old
  * junk.ts
  * x true_or_false.ts
  * go()
  * x samples/container.ts
* Unify EntityDescription with SuiteDescription
* x Blob append logger
* Move code from CLICore to Laboratory
* Stable uuids for documentation generation
* x BUG: benchmark and candidate names should come from image tag
* x BUG: suite names should come from yaml field
* Combine duplicated code in cliMain and cloudMain
* Remove shell parameter from einsteinCommand and cloudCommand
* Combine World and IWorker
* Move world.ts under true_or_false
* x Delete cliArgs.ts
* Rename tutorial to tutorial_builder
* . Tutorial idempotent unit test
* Tutorial read from file specified on command line
* x Why doesn't empty line in tutorial shut down Shell? Irrelevant not that Ctrl-D exits.
* Use chalk or ansi-styles in tutorial
* - Redirect recorded output to stderr to allow results on stdout
* x Strip ANSI escape codes from recorded stdout.
    * https://stackoverflow.com/questions/13801273/what-does-u001bj-represent
    * https://github.com/chalk/strip-ansi
    * https://www.npmjs.com/package/strip-ansi
* x Don't hard-code LocalDisk path in Shell. Irrelevant not that shell is in-memory
* Implement local storage flags for Shell.
* Remove Windows paths from true_or_false sample
* Verfiy localDisk and ls work on Windows
* localDisk: handle ~/tilde in root path
* Duplicate definitions for SymbolTable
* x Applications go in src/applications
* Move sample code out to samples folder
* x Convert CLIArgs class to CLIMain() function
* Catch errors in shell (e.g. duplicate deployments)

## Basic
* Provide candidates with their decrypted secrets   
* Figure out container_image.ts. What is the naming scheme?
  * Review ContainerImage field names.
* x ls and cloud ls should sort. Lexigraphical? Tree order? Are they the same?
* Tutorial should not spit out final code block
* Tutorial feature to limit number of lines in a block (to show first n lines of test case...)
* Tutorial feature to suppress salutation
* CLIMain connects to analysis service as well as laboratory service.
* cloud ls should take one optional parameter - right now has one required
* Write design issue/note about databases vs canonical naming
* Set Benchmark, Candidate, Suite create and owner fields at upload.
* listCommand should use analysis service (analogous to CLI/Laboratory architecture)
* Consolidate yaml loading and schema verification
* cd command should not allow cd into non-existant directory
* consider reimplementing RamDisk and IStorage as a folder tree
* move cwd from shell to some sort of process abstraction
* auto-completing in shell
* save keys / use keys option for einstein deploy
* Shell command line parameters for local and cloud storage
* Should CLI be a member of Shell or is it part of Einstein?
* pass orchestrator to Shell constructor, so readline.Interface can be started as last step.
    * Don't want to take input until shell is fully intialized
    * Probably want to introduce concept of an execution environment or world.
* Shell: help command
* Shell: cloudls
    * cloud ls
    * cloud images
    * cloud services
* Shell: pushd/popd
* Shell: better arg splitter that handles quotes. https://stackoverflow.com/questions/2817646/javascript-split-string-on-space-or-on-quotes-to-array/18647776
* localDisk: ensure paths exist on file create
* services command shows image tags for services
* services command shows volumes for services

## Round-out/Finish-up
* Disk based IStorage - write/append, command-line arguments

## Research
* RBAC
* Figure out pattern for file name combination
* What happens if the Shell's finished promise is awaited multiple times?
* Figure out how to reintroduce persistant history in Shell
* Cloud storage mechanism to prevent blob overwrite - https://stackoverflow.com/questions/47716780/dont-overwrite-azure-blob-storage
* Prototype GRPC build with static stub generation
* Prototype multi-language build
* Prototype container build
* Windows/Linux/OSX/Azure file name lengths - for blob paths

## Scenarios
* Code to generate .md tutorial file from template.
* start shell
    * prepopulate images
    * prepopulate yaml benchmark, suite, and candidate files
* images
* services
* einstein deploy labratory
* services
* ls
* more benchmark.yaml
* einstein benchmark benchmark.yaml
* einstein list benchmarks
* more suite.yaml
* einstein suite suite.yaml
* einstine list suites
* more candidate.yaml
* einstein encrypt candidate.yaml
* more candidate.yaml
* einstein candidate candidate.yaml
* einstein list candidates
* einstein run candidate suite
* services
* einstein list runs
* einstein show run xxxxx


## Other
* CLI connection to labratory based on configuration file
* Better handling of timeouts - e.g. einstein deploy
* Shell: exit command instead of blank line
* Shell: suppress dot commands?
* Docker image parser - https://stackoverflow.com/questions/37861791/how-are-docker-image-names-parsed
* localDisk: unit tests
* IStorage: change listBlobs API to distinguish between path not found and empty directory.

* IStorge:listBlobs needs to be consistent across localDisk and ramDisks
* Extract naming-library and loader
* IStorage from Volume[]
* Wildcard matching
* Logging
* Schema verify after all yaml loads.
* Better ajv errors.
* Error check FooDescription name fields. Need to be legal in blob names.
* Suite upload utility methods

## Sample Benchmark and Candidate
* Naming utilities
    * UUID generation - https://www.npmjs.com/package/uuid
    * CandidateDescription => blob path
    * BenchmarkDescription => blob path
* Secrets
    * Move sample out of library
    * Unit tests
* Cloud abstraction layer: in-memory storage emulator
    * Copy from file system
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

## Done
* x Move localWorker, localOrchestrator, ramDisk to local directory.
* x LocalWorker.shutdown()
* x sleep() to utilities
* x Shell: cd command - proper path joining
* x Shell: figure out how to get cwd into prompt
* x Deal with the two Image classes.
* Servrets
    * x Encryption algorithm
* Cloud Abstraction Layer
    * x List blobs matching prefix
    * x Read blob
    * x Create blob
