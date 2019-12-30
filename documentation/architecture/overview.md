# Einstein Overview

## Terminology

* **Laboratory** - 
* **Benchmark** - 
* **Suite** - 
* **Measure** - 
* **Candidate** - 
* **Series** - 
* **Run** - 
* **Data** - 
* **(placeholder)** - 

## Test Run
* Decrypt candidate secrets
* Start candidate container with secrets volume
* Start benchmark container with test suite parameter

## Candidate
* Initialze
* Start up gRPC service
* Handle requests until instructed to exit
* Exit

## Benchmark

* Container runs
* Startup parameters
    * Candidate service endpoint
    * Candidate id
    * Suite id
* Wait for Candidate service to become responsive
* Run each test case in the suite
* Write out test run results
* Tell candidate to shut down
* Exit

