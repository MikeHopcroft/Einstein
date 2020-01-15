# Einstein Shell Tutorial

Einstein provides an interactive `Shell` for trying out concepts in a self-contained, simulated cloud environement that runs on the local machine. This tutorial introduces the `Shell` and then uses it to walk through the following concepts

* Deploying the `Einstein Service`
* Uploading a `Benchmark`
* Uploading a `Suite`
* Uploading a `Candidate`
* Running a `Suite` for a `Benchmark` on a specified `Candidate`
* Examining the results of the `Run`
* Administering the `Einstein Service`

Our first step is to get a copy of `Einstein`. Currently the only way to install `Einstein` is to build it from source code.

## Building Einstein
`Einstein` is a [Node.js](https://nodejs.org/en/) project,
written in [TypeScript](https://www.typescriptlang.org/).
In order to use `Einstein` you must have
[Node](https://nodejs.org/en/download/) installed on your machine.
`Einstein` has been tested with Node version 10.15.3.

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
einstein:/% services
no services running
einstein:/% einstein deploy lab
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

## Submitting a Benchmark

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
einstein:/% einstein benchmark benchmark.yaml
einstein:/% einstein list benchmarks
~~~

We can even see the blob has been written. Note that end users won't be able to do `cloud ls`.

[//]: # (shell)
~~~
einstein:/% cloud ls
~~~

## Submitting a Suite

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
einstein:/% einstein suite suite.yaml
einstein:/% einstein list suites
~~~

## Submitting a Candidate

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
einstein:/% einstein candidate benchmark.yaml
einstein:/% einstein list candidates
~~~


## Running a Suite

Key points:
* einstein run
* einstein list runs
* einstein show run

[//]: # (shell)
~~~
einstein:/% einstein run true_or_false_candidate:1.0 True_Or_False
einstein:/% einstein list runs
~~~

## Examining Cloud Storage

Key points:
* Logging for Einstein laboratory service.
* Run logging for candidate and benchmark.
* Run results.
* Benchmark manifests.
* Suite manifests.
* Candidate manifests.

[//]: # (shell)
~~~
einstein:/% cloud ls
~~~

## Managing VMs

Key points
* Data scientists need to interactively explore sample data to gain insights into feature extraction and model design.
* Interactive access through VMs deployed to cluster.

[//]: # (shell)
~~~
einstein:/% einstein create vm
einstein:/% einstein destroy vm
~~~

## Administering the Einstein Laboratory Service

Key points:
* Approving and revoking white listed services.
* Managing roles
  * Contest Creater
  * Data Scientist
  * Contestant
  * Einstein Administrator

The end.
