# Open Questions

## RPC approach for LabratoryService
* Callable from web client
* Callable from CLI
* Would we consider gRPC? See [this note on gRPC in the browser.](https://grpc.io/blog/state-of-grpc-web/)

## RPC approach for Benchmark-Candidate interactions
* Considering gRPC
* What are pros/cons of gRPC vs HTTP+JSON?
* NOTE: a benchmark can specify any RPC mechanism for its canidate interactions.

## Can we avoid databases altogether?
* Simplifies DevOps
* Write-only stores for Benchmarks, Candidates, TestSuites, and TestRuns
* May need some canonical naming schemes, if there is no centralized database.
* Caching. Can we get away with listing all blobs of a certain type (e.g. benchmark or candidate) when doing searches?

## Naming scheme for blobs
* Consider hashing of canonical representation.
* Consider assigning GUIDs at creation time.
* Would like the ability to list/browse benchmarks/candidates/test suites.
* Folder structure for grouping related items (e.g. all test suites for a benchmark in one folder).

## Naming scheme for candidates, benchmarks, suites, runs, and series
* Would like to be able to use friendly names. This might conflict with using hashes or guids.
* Would need to enforce unique naming of blobs. How can this be done in the presence of concurrancy?
* Is friendly name derived from container image name, or is there a need to have multiple friendly names for a single image (e.g. two YAML manifests share an image, but provide different white-listed services)

## Candidate Sandbox
* Limit access to certain blobs
* Limit access to external services
* Allow access to white-listed services

## Versioning
* For test run outputs.
* For candidates. Based on container version?
* For benchmarks. Based on container version?
* For test suites.
* Future proofing in general.

## Candidate Secrets
* How are candidate secrets passed to candidate?
* Consider public/private key encryption of stored secrets.
* Can candidate secrets be updated over time? How does this impact reproducibility?

## Authentication
* Managing benchmarks and test suites
* Managing candidates
* Submitting candidates
* Running tests
* Viewing test run data
* Granting candidates temporary access to data

## Cloud Agnostic

* Clouds
  * Docker compose for local development (with [Azurite](https://github.com/Azure/Azurite)).
  * Azure
* Abstraction layer
  * Blob manipulation
  * Blob events
  * Container manipulation
  * RBAC

## OS Agnostic

* Is there any benefit to running serices on anything other than Linux containers?
* CLI should run on Linux, OSX, and Windows

## Caching and Reporting
* Blob events trigger second system that updates database tables and reports.
* Database only exists for queries
* Database can be recreated at any time from blobs
