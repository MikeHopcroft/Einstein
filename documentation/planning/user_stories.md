# Outline of Einstein Scenarios

## Contestant

* Candidate Lifecycle
    * Candidate Authoring
        * Understand how to create a candidate
            * Documentation
            * Candidate skeleton in TypeScript
            * Candidate skeleton in Python 3x
        * Understand the target benchmark
            * Documented API
            * Sample data
        * Ability to access external, whitelisted endpoints
        * Secrets management
        * Versioning
    * Candidate Training
        * Training data
    * Candidate Development Runs
        * Diagnostic data
        * Log data
        * Limits in number of runs?
    * Candidate Contest Runs
        * Authenticated users
        * Aggregate measures
        * Persisted measures
        * Qualification requirement for contest runs?
        * Limits on number of runs?
* Benchmark Lifecycle
    * Design and build benchmark
    * Advertising available benchmarks - Prospectus
    * Suite Lifecycle
        * Domain data
        * Test data
        * Test cases
* Runs Lifecycle
    * Initiating a run
    * Listing runs
    * Examining the results of a run
        * Logs
        * Measures
        * Meta-data
* Einstein Lifecycle
    * Deploying Einstein to an Environment
    * Upgrading Einstein
    * Managing the white list
    * Managing authenticated users
    * Log analysis for compliance
    * Removing users, candidates, benchmarks, suites, runs, data, logs
* Analysis
    * Measures consumable by analysis systems like PowerBI
* Dataset Exploration
    * VMs in laboratory environment
* Privacy
* Multi-tenant
    * Who can look at Run results?
    * Which information is visible to a Contestant?
        * Are they aware of other contestants?
        * Can they examine other results?
