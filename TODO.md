# TODO LIST

## Next
* x Upgrade node and fix passphrase issue
  * x einstein:/% einstein run true_or_false_candidate:1.0 True_Or_False
  * x +Passphrase required for encrypted key
* Prime number sample
* Services like Laboratory should log exceptions
  * e.g. Invalid format for decryption.
* Create a "no-symbols" suite
* back to back runs of "einstein deploy lab" - error messages print over prompt
* Naming service container parts - name from component, not version. Version in table column.
* Naming service should get Ids from instances of Benchmark, Candidate, Suite, Run, Audit, etc.
* Naming service should base32 encode table names for results
* show tables command?
* x einstein deploy from yaml specification
  * x deploy to correct port
  * x cli saves host and port for laboratory and repository
* x "einstein list benchmarks" has a hard-coded repository
* x Prevent overwrite of blob on all IStorage implementations.
* x einstein:/% einstein run true_or_false_candidate:1.0 T
  * x RamDisk: file /suites/ag not found.
* x einstein:/% einstein run alwaysTrue_candidate:1.0 True_Or_False
  * x RamDisk: file /candidates/c5p7erbteda74xb5bxhp2vk4d5j62x3578rjwc0 not found.
* x Trivial candidate log mode - always true or always false
* x Shouldn't be able to upload a candidate/benchmark/suite multiple times.
  * x Need to add overwrite parameter to blob write method.
* x Demonstrate encryption in candidate log
* x "cloud more logs/c*" matches everything in logs
* x Consider murmurhash then base32 for guids
* x Orchestrator.createWorker() should create proper volume
* x einstein list runs shows name=foo
* x LocalTableSet.getTable(): unknown table "true_or_false_benchmark:1.0" - einstein results before running
* x Broken: einstein list runs
* x Broken: crawling runs
* repository service
  * audit table
  * uniform use of naming library in repository
  * unit test helper that waits for new run blob - remove sleeps
  * data-driven schemas for benchmarks, candidate, runs, suites tables?
  * benchmark table captions - specify captions that are not the same as column names.
  * benchmark table formatters - specific numerical, fixed, date, etc.
  * benchmark table aligners - left, right
  * . integrate with cli
    * minimist? -b=, -c=, -s=
    * x einstein summarize benchmarkId|suiteId|CandidateId?
    * x einstein results benchmarkId|suiteId|CandidateId?
  * x benchmarks, candidates, runs, suites tables not initialized on startup
    * x Remove cli/list.ts - dead code
    * x Create results table on benchmark upload. Do this before uploading benchmark yaml. This doesn't work on rebuild of database.
    * x LocalTableSet.getTable(): unknown table "runs"
    * x Better error message
  * x einstein list uses CLICore
  * x cloud abstraction for tables
    * x does prototype need this abstraction?
    * x Can't it just inline its own implementation of tables?
  * x cloud events for blobs
  * x benchmark table schemas
  * x crawl benchmarks
  * x crawl runs
  * x crawl suites
  * x crawl candidates
  * x add delay to repository startup
  * x einstein deploy starts repository
  * x alwaysFalse_candidate:1.0
  * x alwaysTrue_candidate:1.0
* IDatabase, LocalDatabase
  * primary key uniqueness => important for avoiding duplicates
  * column type checking
  * numeric column types
  * using object with properties, rather than arrays for rows??
* Setting create time automatically
* Setting owner/submitter automatically
  * shell su command?
* Animal/Mineral/Vegitable?
* Whitelist approval
* einstein create vm
* einstein connect
* ssh to other hosts - need to modify tutorial builder to detect prompts on other servers
* Set up unit testing
* x repository tabular view of run results with schema from benchmark spec
* x true or false repl
* x Logging
* x cloud more
* x einstein create gets type from yaml
* x worker.log replaces console.log
* x schema verification for TestSuite (vs SuiteDescription)
* x catching exceptions in shell.processline

## Tutorial script

* cloud ls logs* - need to handle optional argument
* architecture diagram for each step


## Housekeeping
* Improve top-level README.md
* Bring over architectural documents
* Set up formatting properties for VS Code
* Set up Travis
* Prettier clean

## Easy
* Hard-coded port numbers: 8080
* LoadFoo() splits into LoadFooFromId() and LoadFooFromBlob().
* Better error message for "RamDisk: file /suites/aht7ataz9xt5yhk1dhtpa not found". Really want "Can't open suite True_Or_False".
  * RamDisk: file /candidates/c5p7erbteda74xb5bxhp2vk4d5j62x3578rjwc0 not found.
* Living spec: name, description, owner = 'foo'
* BUG: can run test without benchmark schema
* Rename camelCase files to under_score?
* Rename tutorial to tutorial_builder
* Implement local storage flags for Shell.
  * world.ts: suppress localStorage initialization on disk.
  * Verfiy localDisk and ls work on Windows
  * localDisk: handle ~/tilde in root path
* Stable uuids for documentation generation
* . Tutorial idempotent unit test
* - Use chalk or ansi-styles in tutorial
* - Shell print list of commands
* - Redirect recorded output to stderr to allow results on stdout
* x BUG: can run test without candidate schema
* x TypeError() => new TypeError()
* x Tutorial read from file specified on command line
* x Unify EntityDescription with SuiteDescription
* x Combine World and IWorker
* x Move sample code out to samples folder
* x Duplicate definitions for SymbolTable
* x Combine duplicated code in cliMain and cloudMain
* x Remove Windows paths from true_or_false sample
* x Move world.ts under true_or_false
* x Remove shell parameter from einsteinCommand and cloudCommand
* x Shell.setWorkingDirectory() migrates to World.
  * x Actually, shell needs to update prompt when cwd changes.
* x Cloud commands (ls, more) should not be relative to filesystem cwd
* x BUG: `einstein deploy` should not work without a host parameter.
* x Don't hard-code LocalDisk path in Shell. Irrelevant not that shell is in-memory
* x Applications go in src/applications
* x Convert CLIArgs class to CLIMain() function
* x Blob append logger
* x getPrefix() should move to naming.ts
* x BUG: benchmark and candidate names should come from image tag
* x BUG: suite names should come from yaml field
* x Delete cliArgs.ts
* x Why doesn't empty line in tutorial shut down Shell? Irrelevant not that Ctrl-D exits.
* x Strip ANSI escape codes from recorded stdout.
    * x https://stackoverflow.com/questions/13801273/what-does-u001bj-represent
    * x https://github.com/chalk/strip-ansi
    * x https://www.npmjs.com/package/strip-ansi
* x Remove dead code files and debug configurations
  * x junk2.ts
  * x shell.old
  * x junk.ts
  * x true_or_false.ts
  * x go()
  * x samples/container.ts

## Basic
* Sort out use of "/" in Volume. Are mount points relative to "/"?
* Error handling design allows detection of certain classes of errors for modification
  * E.g. file not found => cannot find suite
* Shell process.on('unhandledRejection') - review/remove/replace?
* Managing white lists
* Managing roles
* interface naming for specs, entities, etc.
* simplify specs (e.g. no name field, fill in owner and created fields)
* Living spec: run 2nd and 3rd candidate. Will need some way to show results.
* Provide candidates with their decrypted secrets 
* . Move code from CLICore to Laboratory
* CLIMain connects to analysis service as well as laboratory service.
  * Move code from CLICore to Analysis/Repository/???
* Yaml loaders should work like the formatters (ie share code)
  * getPrefix(): make collection be an enum - of strings or symbols?
* Verify YAML schemas
* Transition to CommandDispatcher (cliMain.ts, cloud.ts, shell.ts)
  * show cloud command usage
  * formatArgs() duplicated
  * cloud ls should take one optional parameter - right now has one required
* Catch errors in shell (e.g. duplicate deployments)
  * Who catches rejected promises that happen in readline?
* Shell into other servers?
* Figure out container_image.ts. What is the naming scheme?
  * Review ContainerImage field names.
* Tutorial should not spit out final code block
* Tutorial feature to limit number of lines in a block (to show first n lines of test case...)
* Tutorial feature to suppress salutation
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
* Shell: cloud ls
    * x cloud ls
    * x cloud more
    * cloud images
    * cloud services
* Shell: pushd/popd
* Shell: better arg splitter that handles quotes. https://stackoverflow.com/questions/2817646/javascript-split-string-on-space-or-on-quotes-to-array/18647776
* localDisk: ensure paths exist on file create
* services command shows volumes for services
* x services command shows image tags for services
* x BUG: uploadCandidate should use encoded container name, not filename
* x ls and cloud ls should sort. Lexigraphical? Tree order? Are they the same?

## Specs/Design Notes
* apiVersion
* YAML files structure
  * shared regions
* error handling
*   exception hierarchy
* RPC approach
* naming
  * use of container names
  * mapping to blob names
  * threat modelling
* cloud abstraction layer
* Evaluation of golang
  * base32
  * uuid
  * strip-ansi
  * rpc
  * encryption
  * hashing
  * yaml read/write/schema error messages
  * readline
    * history
    * auto-complete
  * cloud sdks
  * unit testing
* Evaluation of C#
* Evaluation of Node/Typescript
  * What version of Node? 10.15.3 and 13.5.0 have different encryption behavior around passphrases



## Round-out/Finish-up
* Disk based IStorage - write/append, command-line arguments

## Research
* Threat modelling
  * SQL injection
  * Other injection attacks, e.g. other command-line or HTTP text
    * Blob name escaping
    * Blob name length violation - could make different logical blobs map to same physical blob
    * Blob names with slashes in them
    * .. and / in names
  * Running a container that wasn't configured VIA a properly uploaded spec
  * Writing a rogue spec to blob storage
  * Impersonating another user
  * Candidate viewing private data
  * Candidate configuring environment
  * Candidate exfiltrating private data
  * Unauthorized uploads and runs
  * Denial of service
* Naming schemes that don't exceed blob and container length limits (https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata)
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
