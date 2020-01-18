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
image           host   port
labratory:1.0   lab    8080
~~~

We can use the `cloud ls` command to see that logging has started for the laboratory service:

[//]: # (shell)
~~~
einstein:/% cloud ls
logs/lab
~~~

If we examine the log, we can see that the Laboratory service has started:

[//]: # (shell)
~~~
einstein:/% cloud more logs/lab 
lab: Labratory.entryPoint()
lab: Labratory service running at lab:8080
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
labratory:1.0
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
apiVersion: 0.0.1
kind: Benchmark
name: True_Or_False
description: A sample benchmark for boolean expressions evaluation.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
image: 'true_or_false_benchmark:1.0'
~~~

Uploading the benchmark:

[//]: # (shell)
~~~
einstein:/% einstein create benchmark.yaml
Uploaded to /benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0

einstein:/% einstein list benchmarks
image                         name            owner   created                 
true_or_false_benchmark:1.0   True_Or_False   Mike    2020-01-07T04:09:18.721Z
~~~

We can even see the blob has been written. Note that end users won't be able to do `cloud ls`.

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
logs/lab

einstein:/% cloud more benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
apiVersion: 0.0.1
kind: Benchmark
name: True_Or_False
description: A sample benchmark for boolean expressions evaluation.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
image: 'true_or_false_benchmark:1.0'
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
apiVersion: 0.0.1
kind: Suite
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
einstein:/% einstein create suite.yaml
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
apiVersion: 0.0.1
kind: Candidate
name: True_Or_False
description: A sample candidate that implements a boolean expression parser.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
image: 'true_or_false_candidate:1.0'
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
apiVersion: 0.0.1
kind: Candidate
name: True_Or_False
description: A sample candidate that implements a boolean expression parser.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
image: 'true_or_false_candidate:1.0'
password:
  secret: >-
    XW48Kl6zD002aFVf1+aYQjtIhtf0aTMDQGQS0TyUiFR1t1ZtT2eWp6CdmI9/EwXxVG5pmhgmZi3lBMMRp//Y6A1v8A23YF+lvrgzro9wNSjIEPlpZiiYJRGg9h1z1jMkrR7a6Y8nHpCeZYsF5UcAuoTOkPPKJHcxMzCgInEBpkb2zL0aCHyBvq1LvGnh50zFtYNRjqo7jjaByOcrxNtpjAYGU/Icr3ct9zm+t+2g9P7elzzlCKQgxMk1TUWLRqhdmtQr960jdrYpDva8N068nqSejAjuTNOHmbCR4F+L6WrjHfUUq0DBXHR5DLze2pKMVMxJ0rn/ltiFObtMbw0jUgcr6DQfSH3Od0Gj9Cw3pIStkdqIT0+AwHcY50KLyNx5JrjChq6qT2sfslKh2O5XFvjHUx5cDeDQ4tX2n5gmy+FJTta/TGp485aWcABk8YHljOvMyrkvOp6388b4xF8FfNJnx3fwFeiH3fZiXah0JZT2/9CEmtMe+8kGPXFpJzZUWlXPtjV2oSWWggQcwbT5VSXWNWFJa/VmB1Fs7xQL/Dyxxssp1dPTuty1E3piFMfHYNbl2fJ0exNl8Qb1SQVvrXkPX2V0fp59mZAAhanqiazyiJ6CQDjFvrlfzy03dJByX41tx9xNn29Gnko3KBqUAOrNI7kHhHlVyJM/cQQGeIY=:eWuy2Op3Pd6u5mXNZh37Lg==:pNwZexF4g461IB/JxODNgQ==
whitelist:
  - 'http://www.wikipedia.org'
~~~

Uploading the candidate:

[//]: # (shell)
~~~
einstein:/% einstein create candidate.yaml
Uploaded to /candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0

einstein:/% einstein list candidates
image                         name            owner   created                 
true_or_false_candidate:1.0   True_Or_False   Mike    2020-01-07T04:09:18.721Z
~~~


## Running a Suite

Key points:
* einstein run
* einstein list runs
* einstein show run

[//]: # (shell)
~~~
einstein:/% einstein run true_or_false_candidate:1.0 True_Or_False
run(true_or_false_candidate:1.0, True_Or_False)
Starting candidate true_or_false_candidate:1.0 on e61c370b-0abb-40a4-89b9-fa0b0d4c21d4
Starting benchmark true_or_false_benchmark:1.0 on f2e2291e-0832-4f9a-ae9a-16c347e0e662

einstein:/% einstein list runs
name   candidate   benchmark   suite   date

einstein:/% # wait 20 seconds for run to complete ...
einstein:/% einstein list runs
name                                   candidate                     benchmark                     suite           date                    
f2e2291e-0832-4f9a-ae9a-16c347e0e662   true_or_false_candidate:1.0   true_or_false_benchmark:1.0   True_Or_False   2020-01-18T02:50:10.713Z
~~~

Examining run log:

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0
logs/e61c370b-0abb-40a4-89b9-fa0b0d4c21d4
logs/f2e2291e-0832-4f9a-ae9a-16c347e0e662
logs/lab
runs/f2e2291e-0832-4f9a-ae9a-16c347e0e662
suites/aht7ataz9xt5yhk1dhtpa

einstein:/% cloud more runs/*
Contents of /runs/f2e2291e-0832-4f9a-ae9a-16c347e0e662:
kind: Run
apiVersion: 0.0.1
runId: f2e2291e-0832-4f9a-ae9a-16c347e0e662
candidateId: 'true_or_false_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: foo
description: foo
owner: foo
created: '2020-01-18T02:50:10.713Z'
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
benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0
logs/e61c370b-0abb-40a4-89b9-fa0b0d4c21d4
logs/f2e2291e-0832-4f9a-ae9a-16c347e0e662
logs/lab
runs/f2e2291e-0832-4f9a-ae9a-16c347e0e662
suites/aht7ataz9xt5yhk1dhtpa
~~~

## Managing VMs

Key points
* Data scientists need to interactively explore sample data to gain insights into feature extraction and model design.
* Interactive access through VMs deployed to cluster.

[//]: # (shell)
~~~
einstein:/% einstein create vm
RamDisk: file /vm not found.

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