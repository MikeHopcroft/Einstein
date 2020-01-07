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

When the shell starts up, it prints a welcome message. Typing `"help"` at this point will list available commands:

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
image                                 host   port
myregistry.azurecr.io/labratory:1.0   lab    8080
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
Uploaded to /benchmarks/5xh6avk3d1pp2wkb5twp2vbc

einstein:/% einstein list benchmarks
image                         name            owner   created                 
true_or_false_benchmark:1.0   True_Or_False   Mike    2020-01-07T04:09:18.721Z
~~~

We can even see the blob has been written.

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/5xh6avk3d1pp2wkb5twp2vbc
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
Uploaded to /suites/5xtqaubmcmq7jrbddg

einstein:/% einstein list suites
name            benchmark                     owner   created                 
True_Or_False   true_or_false_benchmark:1.0   Mike    2020-01-07T04:09:18.721Z
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
    vRcAubHGF5ECxjfur28iF6Nx/qNeQlLCJfrlndx0XUedsHQsJcm71oxRBIQmR1L4Vyd+WoLk1K560obgN1nYlCYLUr4BSyrX6xSV7HHkIMBpI+bJ+FG6jpzNMBxEBMCMdqBQa/uAIQjT+Fo+DbqFgo3ANUI6yLZdsr+Hy7FQW+vrx8HcFbMz4h3bYA/iAFzJHgH6c5qhUAH58qIdDkJUl42M/x6dLl1L40BEbsfr6+L4MqcrDhGWN8RuhqkKij8ARI6N1uUj6+BvwPMWE1L6OiWfDWdETuP92VCtQlh4so+6nLM/zaHwwlew5jwtRnSBOidp5nI+9UQ0YJxaG/7KZz0l1vYp1lESwQ7buOPluYLHzV3kkcVTtW3fGAJO+SBx340U9/n1SwfX2PjGL/AdOdU5zURovEbtx/h9Phl53IpDupvHzWLH1RREwcx7t8ZtM4kcQ3rnG7IlTMMdoJc3CWEG2NsHReSkyviUUyqXuywxOyn0PjXSS7CF8xs9A6lOw4b6/Oe2o5cDG+NEH9/Kw1uXsAOnKQ8OVrISXcRwyiQv0VRBn7x5G5pCd36fC3xogjQ6yqh0X/ChGL+aoR9Jez5CZ9mxKBV4O4fpc6dmK7URomy1aam4dZaheBSMu05rhI0FkFtcTx/YU9J2VF47njnzBTubjm/qb8HPxNbPyFs=:fwe9RKWfGaZxUjNZrGUnwg==:gb7zzqRTwIAyMIDx0GJLZA==
whitelist:
  - 'http://www.wikipedia.org'
~~~

Uploading the candidate:

[//]: # (shell)
~~~
einstein:/% einstein candidate benchmark.yaml
Uploaded to /candidates/5xh6avk3d1pp2wkb5twp2vbc

einstein:/% einstein list candidates
image                         name            owner   created                 
true_or_false_benchmark:1.0   True_Or_False   Mike    2020-01-07T04:09:18.721Z
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
Bad collection "runs"
~~~

## Examining Cloud Storage

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/5xh6avk3d1pp2wkb5twp2vbc
suites/5xtqaubmcmq7jrbddg
candidates/5xh6avk3d1pp2wkb5twp2vbc
~~~

The end.

~~~
einstein:/% 
bye

~~~