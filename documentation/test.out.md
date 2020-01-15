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
Available shell commands:
  cd
  cloud
  einstein
  exit
  help
  images
  ls
  more
  pwd
  services
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

We can use the `cloud ls` command to see that logging has started for the laboratory service:
[//]: # (shell)
~~~
einstein:/% cloud ls
logs/lab
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
true_or_false_benchmark:1.0
true_or_false_candidate:1.0
alwaysTrue_candidate:1.0
alwaysFalse_candidate:1.0
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

We can even see the blob has been written. Note that end users won't be able to do `cloud ls`.

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/5xh6avk3d1pp2wkb5twp2vbc
logs/lab

einstein:/% cloud more benchmarks/5xh6avk3d1pp2wkb5twp2vbc
name: True_Or_False
description: A sample benchmark for boolean expressions evaluation.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
image: 'myregistry.azurecr.io/true_or_false_benchmark:1.0'
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
name: True_Or_False
description: A sample suite.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
domainData:
  - name: a
    value: true
  - name: b
    value: true
  - name: c
    value: true
  - name: x
    value: false
  - name: 'y'
    value: false
  - name: z
    value: false
testCases:
  - input: a
    expected: true
  - input: b
    expected: true
  - input: x
    expected: false
  - input: '!a'
    expected: false
  - input: '!b'
    expected: false
  - input: '!x'
    expected: true
  - input: (a)
    expected: true
  - input: (x)
    expected: false
  - input: a & b
    expected: true
  - input: a & b & c
    expected: true
  - input: a & x
    expected: false
  - input: a & b & x
    expected: false
  - input: a | b
    expected: true
  - input: a | x
    expected: true
  - input: x | y | z | a
    expected: true
  - input: x | y
    expected: false
  - input: '!(x & y)'
    expected: true
  - input: '!(a | b)'
    expected: false
  - input: '!a & !x'
    expected: false
  - input: '!x & !y'
    expected: true
  - input: '!a & !b'
    expected: false
  - input: '!x & !b'
    expected: false
  - input: '!!a'
    expected: true
  - input: '!!!a'
    expected: false
  - input: x & a | b
    expected: true
  - input: (x & a) | b
    expected: true
  - input: x & (a | b)
    expected: false
  - input: ((a | x) & (b | y) & ((c | x) | (d | y)))
    expected: true
  - input: foo
    expected: true
  - input: bar
    expected: true
  - input: foo-bar
    expected: true
  - input: foo & bar & !baz-baz
    expected: true
  - input: '    a   &b & c   '
    expected: true
  - input: a&b&c
    expected: true
  - input: (a&b
    expected: Expected ')'
  - input: (a|b
    expected: Expected ')'
  - input: a&
    expected: Expected a variable
  - input: a |
    expected: Expected a variable
  - input: '&'
    expected: Unexpected operator "&"
  - input: '|'
    expected: Unexpected operator "|"
  - input: '!'
    expected: Expected a variable
  - input: (
    expected: Expected a variable
  - input: )
    expected: Unexpected operator ")"
  - input: a b
    expected: Expected '&' or '|' operator
  - input: (a+b))
    expected: Expected '&' or '|' operator
  - input: ''
    expected: Expected a variable
  - input: '   '
    expected: Expected a variable
~~~

Uploading the suite:

[//]: # (shell)
~~~
einstein:/% einstein suite suite.yaml
Uploaded to /suites/aht7ataz9xt5yhk1dhtpa

einstein:/% einstein list suites
name            benchmark                     owner   created                 
True_Or_False   true_or_false_benchmark:1.0   Mike    2020-01-07T04:09:18.721Z
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
    Uf2ObY/xXFdPqKl5tFxFolODTsQbfS8L13mnS2OqkbOvqDBur1j56RnaZvmmcUOlIpkkmrLgCAXFaIIHoFOlcV+0YkGjPyimGkRuHMuZEfzeo+UKoPHPkB9xC2ZpDkv9gkr7Zyq1fa5o+wvrNYy+spgfg+B6MkARMRspc3tgAiSD0KIsbNy/Hm24a/pj3Etgz0Hukhb0OksC8dt6a7L1RKsz5j+FPfRhSyrScY4JjtZp+rQ/Y0hO8IXz0Q+UpCCs5MIN5mvvBLwVyP80K/vf01eeNNNmFE6f2yhAUBgEoCAJYP39Z0ExYP2h2vWfvAr5iCj7pZoAUP0aCNVIbDeUU/MapHmR0KJq0sJ6RUFzjrcUuTeMgR5Yr5cT+g/auf9EYOnboVmVpiWqq98wJX1DjY6bYGwfCQTKjUj8NhtmvTsQ+lSiqRieMfsySUCnBjwczr+sM64X9MucuDjHi4gx7pgdDhfehwXElUQ3wmDgrZ80UxIWWDQzdgRuCgylcXqHkpMCMW0ouP/egwCJqaxTk30xgPAlNRVJAkP82zcPfmeri5dQB5rUatIuOfCn3e3wPHaPp2eHgwpdDVxN+TKAxC6wUA5dyFOkEoPfQcDluGyMEjRsh+bm4zBJjTf0CH6GCnvwUVsDlHksKhb6wcv190vNf3biFG3dmW5+2BpRFOw=:jdDsfrjHuw/k5h13Gmskyg==:xWUzS5esM+PqMI22drc1QA==
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


## Running a Suite

Key points:
* einstein run
* einstein list runs
* einstein show run

[//]: # (shell)
~~~
einstein:/% einstein run true_or_false_candidate:1.0 True_Or_False
Starting candidate true_or_false_candidate:1.0 on e5f6c767-1a48-4b45-b4e7-4e12e732493e
Starting benchmark true_or_false_benchmark:1.0 on ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea

einstein:/% einstein list runs
name   candidate   benchmark   suite   date

einstein:/% # wait 20 seconds for run to complete ...
einstein:/% einstein list runs
name                                   candidate                     benchmark                     suite           date                    
ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea   true_or_false_candidate:1.0   true_or_false_benchmark:1.0   True_Or_False   2020-01-15T01:32:08.686Z
~~~

Examining run log:

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/5xh6avk3d1pp2wkb5twp2vbc
candidates/5xh6avk3d1pp2wkb5twp2vbc
logs/ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea
logs/e5f6c767-1a48-4b45-b4e7-4e12e732493e
logs/lab
runs/ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea
suites/aht7ataz9xt5yhk1dhtpa

einstein:/% cloud more runs/*
Contents of /runs/ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea:
runId: ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea
candidateId: 'true_or_false_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: foo
description: foo
owner: foo
created: '2020-01-15T01:32:08.686Z'
results:
  passed: 43
  failed: 4
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
benchmarks/5xh6avk3d1pp2wkb5twp2vbc
candidates/5xh6avk3d1pp2wkb5twp2vbc
logs/ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea
logs/e5f6c767-1a48-4b45-b4e7-4e12e732493e
logs/lab
runs/ad7419f0-9fb8-4c1a-b22b-fddfc0e042ea
suites/aht7ataz9xt5yhk1dhtpa
~~~

## Managing VMs

Key points
* Data scientists need to interactively explore sample data to gain insights into feature extraction and model design.
* Interactive access through VMs deployed to cluster.

[//]: # (shell)
~~~
einstein:/% einstein create vm
einstein: unknown command 'create'

einstein:/% einstein destroy vm
einstein: unknown command 'destroy'
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

~~~
einstein:/% 
bye

~~~