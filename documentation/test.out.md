# Einstein Shell Tutorial

Einstein provides an interactive shell for trying out concepts in a self-contained, simulated cloud environement that runs on the local machine. This tutorial introduces the `Shell` and then uses it to walk through the following concepts

* Deploying the `Einstein Service`
* Uploading a `Benchmark`
* Uploading a `Suite`
* Uploading a `Candidate`
* Running a `Suite` for a `Benchmark` on a specified `Candidate`
* Examining the results of the `Run`

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
% npm run install
% npm run compile
~~~

Now that we've built `Einstein`, let's fire up the `Shell`.

## Introducing the Shell

The `Shell` starts up a simulated cloud environment with blob storage, attached volumes, a container registry, and an orchestrator. By default, the blob storage and disk volumes reside in RAM and are initialized fresh for each session. You can use the `--localStorge` and `--cloudStorage` flags to map these stores to folders on your machine. Use this option when you want files to persist across sessions.

Here's how start a session with ephermeral, in-memory stores:
~~~
% node build/applications/shell.js
~~~

Here's an example of a session backed by folders on disk:
~~~
% node build/applications/shell.js --localStorage=~/temp/local --cloudStorage=~/temp/cloud
~~~

When the shell starts up, it prints a welcome message. Typing `"help"` at this point will list a available commands:

[//]: # (shell)
~~~
Welcome to the Einstein interactive command shell.
Type commands below.
A blank line exits.

Type "help" for information on commands.

einstein:/% help
help: command not found
~~~

### Shell Commands

Here's a cheat sheet for the shell commands:

* Local storage
    * ls \<path> - show pre-populated configuration files
    * cd \<path>
    * pushd \<path>
    * popd \<path>
    * pwd
    * more \<path>
* Cloud storage
    * cloud ls \<path>
    * cloud cd \<path>
    * cloud pwd
    * cloud more \<path>
* Orchestration
    * images - lists the images in the container registry
    * services - lists the services currently running in the cluster
* Einstein CLI
    * einstein help
    * einstein deploy
    * einstein encrypt \<file>
    * einstein benchmark \<benchmark description file>
    * einstein suite \<suite description file>
    * einstein candidate \<candidate description file>
    * einstein run \<candidate id> \<suite id>
    * einstein list \<benchmark|candidate|run|suite> \<pattern>
    * einstein show \<benchmark|candidate|run|suite> \<id>

## Deploying Einstein

* Einstein service is a container
* containers
* Generate public and private keys

Initially there are no services running in our cluster.

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
depoying einstein to lab

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

* Description of contest
* Benchmark description file
* containers
* einstein benchmark
* einstein list benchmarks

Shell pre-provisions the container registry.

[//]: # (shell)
~~~
einstein:/% images
myregistry.azurecr.io/true_or_false_benchmark:1.0
myregistry.azurecr.io/true_or_false_candidate:1.0
myregistry.azurecr.io/labratory:1.0
~~~

Shell also pre-provisions yaml configuration files:

[//]: # (shell)
~~~
einstein:/% ls
benchmark.yaml
candidate.yaml
suite.yaml
~~~

Here's the benchmark configuration file:

[//]: # (shell)
~~~
einstein:/% more benchmark.yaml
name: True_Or_False
description: A sample benchmark for boolean expressions evaluation.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
image: 'myregistry.azurecr.io/true_or_false_benchmark:1.0'
~~~

Uploading the benchmark:

[//]: # (shell)
~~~
einstein:/% einstein benchmark benchmark.yaml
uploading benchmark benchmark.yaml

einstein:/% einstein list benchmarks
einstein: unknown command 'list'
~~~

We can even see the blob has been written.

[//]: # (shell)
~~~
einstein:/% cloud ls
cloud: command not found
~~~

## Submitting a Suite

* Suite description file
* Domain data
* einstein suite
* einstein list suites

[//]: # (shell)
~~~
einstein:/% more suite.yaml
name: True_Or_False
description: A sample suite.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
domainData: []
testData: []
~~~

Uploading the suite:

[//]: # (shell)
~~~
einstein:/% einstein suite suite.yaml
uploading suite suite.yaml

einstein:/% einstein list suites
einstein: unknown command 'list'
~~~

## Submitting a Candidate

* Candidate description file

[//]: # (shell)
~~~
einstein:/% more candidate.yaml
name: True_Or_False
description: A sample candidate that implements a boolean expression parser.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
image: 'myregistry.azurecr.io/true_or_false_candidate:1.0'
password:
  secret: my-password
whitelist:
  - 'http://www.wikipedia.org'
~~~

Encrypting secrets

[//]: # (shell)
~~~
einstein:/% einstein encrypt candidate.yaml

einstein:/% more candidate.yaml
name: True_Or_False
description: A sample candidate that implements a boolean expression parser.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
image: 'myregistry.azurecr.io/true_or_false_candidate:1.0'
password:
  secret: >-
    dZG/aIcq+kJV0Zhm5HnauPhzKLAx70BdWITrrSmezUWYLx/ysLiLdFBwonJR839BqSp2rw4iyM8mYurAuqstPnEdh0XFtaHJE0Tspaodq5aR8rrs4vj1BWl5woWAPlqhT/db5uUbS1YgAiZ+84oqGVpmxyPrsFuXU54/UP8cz0A6Q8GxYTG0oyjaWjQwg/rydrN+0nBpFUxKDPYc+qKZzq3FtVEPxdMtAo28hQhLmsbj1544/VgHvT3upMYvKTHKMcS/lbXevFOErv4ZBWY6Ay0UJCUIiG2EyT2Hfw0nKkafSsqo61ubEr+zd/gD6TKMxZKOhGfxvxqj+iStbJ7lOKAd7i/4gn3RozsMXeTirRGnXA/J4HaNrqI6LvKIF8/mD2IUyRwXwjqL+BePiGGUU//yXTxWdBsbuJm63yECGJqHne0tHmSpufK0lIAq3lf2B8xAmOT7vV7ve3ooyKbv3oSh7bEB0mNK8dFPq8MEZYYUrKnx+knBb7X4xSlroZc5CPFr6kWWYqLMi/I8Zxa2vJdc4ppi4S8qZ115BUGZ0klkNgRzAx/ACJ6ouvMo//TFiMcoZG4bWU5H4TAiKY7HEYSB9g53Fh9s1lcd7927ZFtI6sBIax9seVao6yemJfcY5/Jsr6i97san+IBQXl2FMKW/qrDjWLlRyAREYM7s/dM=:NpXjq792ZAzt1FL5pCPVKg==:xmlF8URqww1tu5d/7S8qog==
whitelist:
  - 'http://www.wikipedia.org'
~~~

Uploading the candidate:

[//]: # (shell)
~~~
einstein:/% einstein candidate benchmark.yaml
uploading candidate benchmark.yaml

einstein:/% einstein list candidates
einstein: unknown command 'list'
~~~

* einstein candidate
* einstein list candidates

## Running a Suite

* einstein run
* einstein list runs
* einstein show run

[//]: # (shell)
~~~
einstein:/% einstein run candidateId suiteID
running suite suiteID on candidate candidateId

einstein:/% einstein list runs
einstein: unknown command 'list'
~~~


The end.

~~~
einstein:/% 
bye

~~~