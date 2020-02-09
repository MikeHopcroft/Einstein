# Einstein Shell Tutorial

Einstein provides an interactive `Shell` for trying out concepts in a self-contained, simulated cloud environement that runs on the local machine. This tutorial introduces the `Shell` and then uses it to walk through the following concepts

* Persona: Einstein Administrator
  * Deploying the `Einstein Service`
  * Administering the `Einstein Service`
* Persona: Benchmark Designer
  * Uploading a `Benchmark`
  * Uploading a `Suite`
* Persona: Contestant
  * Uploading a `Candidate`
  * Running a `Suite` for a `Benchmark` on a specified `Candidate`
* Personas: Contestant and Business Decision Makers
  * Examining the results of the `Run`

Our first step is to get a copy of `Einstein`. Currently the only way to install `Einstein` is to build it from source code.

## Building Einstein
`Einstein` is a [Node.js](https://nodejs.org/en/) project,
written in [TypeScript](https://www.typescriptlang.org/).
In order to use `Einstein` you must have
[Node](https://nodejs.org/en/download/) installed on your machine.
`Einstein` has been tested with Node version [13.7.0](https://nodejs.org/download/release/v13.7.0/).

Here are the steps for cloning and building `Einstein`:
~~~
% git clone git@github.com:MikeHopcroft/Einstein.git
% npm install
% npm run compile
~~~

Now that we've built `Einstein`, let's fire up the `Shell`.

## Introducing the Shell

The `Shell` starts up a simulated cloud environment with blob storage, disk volumes, a container registry, and an orchestrator. By default, the blob storage and disk volumes reside in RAM and are initialized fresh for each session. You can use the `--localStorge` and `--cloudStorage` flags to map these stores to folders on your machine. Use this option when you want blobs and files to persist across sessions.

Here's how start a session with ephermeral, in-memory stores:
~~~
% node build/applications/shell.js
~~~

Here's an example of a session backed by folders on disk:
~~~
% node build/applications/shell.js --localStorage=~/temp/local --cloudStorage=~/temp/cloud
~~~

When the shell starts up, it prints a welcome message. Typing `"help"` at this point will list available commands:

[//]: # (shell)
~~~
Welcome to the Einstein interactive command shell.
Type commands below.
A blank line exits.

Type "help" for information on commands.

einstein:/% help
~~~

You can read more about the shell commands [here](shell_commands.md).


## Deploying Einstein

The persona for this section is the `Einstein Administrator`. This would typically be a member of the IT department, tasked with providing a safe environment for storing and accessing sensitive data.

Key points:
* Einstein is a service that runs in the environment
* Must be deployed

Initially there are no services running in our cluster. We can see this by running the `services` command:

[//]: # (shell)
~~~
einstein:/% services
no services running
~~~

Deploy Einstein immediately check services. Nothing running yet.

[//]: # (shell)
~~~
einstein:/% ls
einstein:/% more laboratory.yaml
~~~

[//]: # (shell)
~~~
einstein:/% einstein deploy laboratory.yaml
Deploying to lab.
einstein:/% services
no services running
~~~

Wait a few seconds and check services again. Can see that the host lab is running the Einstein service on port 8080.

[//]: # (shell)
~~~
einstein:/% # wait 10 seconds for service to start ...
einstein:/% services
lab:8080
~~~

We can use the `cloud ls` command to see that logging has started for the laboratory service:

[//]: # (shell)
~~~
einstein:/% cloud ls
~~~

If we examine the logs, we can see that the Laboratory and Repository services have started:

[//]: # (shell)
~~~
einstein:/% cloud more logs/lab
einstein:/% cloud more logs/repository
~~~


## Submitting a Benchmark

The persona for this section is the `Benchmark Designer`. This is a person who is designing and running a contest. They implement a `Benchmark` to conduct the assessment of each `Candidate` solution and measure its characteristics.

Key points:
* Description of contest
* Benchmark description file
* containers
* einstein benchmark
* einstein list benchmarks

Shell pre-provisions the container registry.

[//]: # (shell)
~~~
einstein:/% images
~~~

Shell also pre-provisions yaml configuration files:

[//]: # (shell)
~~~
einstein:/% ls
~~~

Here's the benchmark configuration file:

[//]: # (shell)
~~~
einstein:/% more benchmark.yaml
~~~

Uploading the benchmark:

[//]: # (shell)
~~~
einstein:/% einstein create benchmark.yaml
einstein:/% einstein list benchmarks
~~~

We can even see the blob has been written. Note that end users won't be able to do `cloud ls`.

[//]: # (shell)
~~~
einstein:/% cloud ls
einstein:/% cloud more benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
~~~

## Submitting a Suite

The persona for this section is, again, the `Benchmark Designer`. In this section, we're creating different `Test Suites` for the `Benchmark`. `Suites` may be crafted for a variety of purposes, including
* Providing sample data for algorithm development and testing.
* Providing training data.
* Testing `Candidates` for the contest.
* Providing diagnostic slices of the data (e.g. audio recordings of just male or just female voices).

Key points:
* Suite description file
* Domain data
* Test cases
* einstein suite
* einstein list suites

[//]: # (shell)
~~~
einstein:/% more suite.yaml
~~~

Uploading the suite:

[//]: # (shell)
~~~
einstein:/% einstein create suite.yaml
einstein:/% einstein list suites
~~~

## Submitting a Candidate

The persona for this section is the `Contestant` who is developing a `Candidate` solution for a `Benchmark`.

Key points:
* Candidate description file
* Secrets and encryption
* Whitelist
* einstein candidate
* einstein list candidates

[//]: # (shell)
~~~
einstein:/% more candidate.yaml
~~~

Encrypting secrets

[//]: # (shell)
~~~
einstein:/% einstein encrypt candidate.yaml
einstein:/% more candidate.yaml
~~~

Uploading the candidate:

[//]: # (shell)
~~~
einstein:/% einstein create candidate.yaml
einstein:/% einstein create true_candidate.yaml
einstein:/% einstein create false_candidate.yaml
einstein:/% einstein list candidates
~~~


## Running a Suite

The persona for this section is the `Contestant` who wants to run their `Candidate` solution against a `Benchmark`.

Key points:
* einstein run
* einstein list runs
* einstein show run

[//]: # (shell)
~~~
einstein:/% einstein run true_or_false_candidate:1.0 True_Or_False
einstein:/% einstein run alwaysTrue_candidate:1.0 True_Or_False
einstein:/% einstein run alwaysFalse_candidate:1.0 True_Or_False
einstein:/% einstein list runs
einstein:/% # wait 20 seconds for run to complete ...
einstein:/% einstein list runs
~~~

Examining run results:

[//]: # (shell)
~~~
einstein:/% einstein results true_or_false_benchmark:1.0
~~~

The result table was created by crawling the runs-blobs:

[//]: # (shell)
~~~
einstein:/% cloud ls
einstein:/% cloud more runs/*
~~~

## Examining Cloud Storage

The persona for this section is the `Einstein Administrator` who wants to perform auditing and forensics on the system.

Key points:
* Logging for Einstein laboratory service.
* Run logging for candidate and benchmark.
* Run results.
* Benchmark specifications.
* Suite specifications.
* Candidate specifications.

[//]: # (shell)
~~~
einstein:/% cloud ls
~~~

## Managing VMs

The persona for this section is the `Data Scientist`.

Key points
* Data scientists need to interactively explore sample data to gain insights into feature extraction and model design.
* Interactive access through VMs deployed to cluster.

[//]: # (shell)
~~~
einstein:/% einstein create vm
einstein:/% einstein destroy vm
~~~

## Training Models

**TODO:** write this section.

## Administering the Einstein Laboratory Service

The persona for this section is the `Einstein Administrator`.

Key points:
* Approving and revoking white listed services.
* Managing roles
  * Contest Creater
  * Data Scientist
  * Contestant
  * Einstein Administrator

The end.
