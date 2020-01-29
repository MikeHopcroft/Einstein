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
benchmark.yaml
candidate.yaml
false_candidate.yaml
laboratory.yaml
suite.yaml
true_candidate.yaml

einstein:/% more laboratory.yaml
apiVersion: 0.0.1
kind: Laboratory
name: Einstein
description: Einstein services deployment for demo.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
laboratory:
  host: lab
  port: 1234
repository:
  host: repository
  port: 5678
~~~

[//]: # (shell)
~~~
einstein:/% einstein deploy laboratory.yaml
Deploying from /laboratory.yaml.
Depoying einstein Laboratory to lab
Generating public/private key pair
Deploying einstein Repository to repository

einstein:/% services
no services running
~~~

Wait a few seconds and check services again. Can see that the host lab is running the Einstein service on port 8080.

[//]: # (shell)
~~~
einstein:/% # wait 10 seconds for service to start ...
einstein:/% services
image            host         port
repository:1.0   repository   5678
labratory:1.0    lab          1234
~~~

We can use the `cloud ls` command to see that logging has started for the laboratory service:

[//]: # (shell)
~~~
einstein:/% cloud ls
logs/lab
logs/repository
~~~

If we examine the logs, we can see that the Laboratory and Repository services have started:

[//]: # (shell)
~~~
einstein:/% cloud more logs/lab
lab: Labratory.entryPoint()
lab: sleeping for 9 seconds
lab: woke up
lab: Labratory service running at lab:1234


einstein:/% cloud more logs/repository
repository: Repository.entryPoint()
repository: sleeping for 6 seconds
repository: woke up
repository: Initializing
repository: Initialization complete
repository: Repository service running at repository:5678
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
true_or_false_benchmark:1.0
true_or_false_candidate:1.0
alwaysTrue_candidate:1.0
alwaysFalse_candidate:1.0
labratory:1.0
repository:1.0
~~~

Shell also pre-provisions yaml configuration files:

[//]: # (shell)
~~~
einstein:/% ls
benchmark.yaml
candidate.yaml
false_candidate.yaml
laboratory.yaml
suite.yaml
true_candidate.yaml
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
columns:
  - name: candidateId
    type: string
  - name: suiteId
    type: string
  - name: created
    type: string
  - name: passed
    type: string
  - name: failed
    type: string
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
logs/repository

einstein:/% cloud more benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
apiVersion: 0.0.1
kind: Benchmark
name: True_Or_False
description: A sample benchmark for boolean expressions evaluation.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
image: 'true_or_false_benchmark:1.0'
columns:
  - name: candidateId
    type: string
  - name: suiteId
    type: string
  - name: created
    type: string
  - name: passed
    type: string
  - name: failed
    type: string
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
apiVersion: 0.0.1
kind: Suite
name: True_Or_False
description: A sample suite.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
data:
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
name            benchmarkId                   owner   created                 
True_Or_False   true_or_false_benchmark:1.0   Mike    2020-01-07T04:09:18.721Z
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
apiVersion: 0.0.1
kind: Candidate
name: True_Or_False
description: A sample candidate that implements a boolean expression parser.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
image: 'true_or_false_candidate:1.0'
whitelist:
  - 'http://www.wikipedia.org'
data:
  password:
    secret: my-password
~~~

Encrypting secrets

[//]: # (shell)
~~~
einstein:/% einstein encrypt candidate.yaml
Encrypted /candidate.yaml

einstein:/% more candidate.yaml
apiVersion: 0.0.1
kind: Candidate
name: True_Or_False
description: A sample candidate that implements a boolean expression parser.
owner: Mike
created: '2020-01-07T04:09:18.721Z'
benchmarkId: 'true_or_false_benchmark:1.0'
image: 'true_or_false_candidate:1.0'
whitelist:
  - 'http://www.wikipedia.org'
data:
  password:
    secret: >-
      DsoqCEwAzrOXM34yN2nWWZC6LJgZRIE+q0L9YJnk6e1i5jS5L5s9HLEhBXNaeBK4jB2CrNRHkff1Z7Te1K79jwJEj6JKhFAfl5fgbc6/AXatvkixQF6BiJYVF/eUoIRG0Zrf+iQ769i85zdINLWFXP0Y6wjV5HzSaghJUpC6ui7X2/xxdayRk7V1aQrEnvtjp00bSEaIT7q0JcK7BC6rFaBFmTRGoXjrYqJNJka3okhvMmDaUObQH2KczF19UewWIgHDQ4yAlyQUN17xZHS4YNH6MPxs3aPNpeN/BRpC6f9yexdBRkMqdJ+5ElyUhMrDZxcQlYmy+53azRqp7xSnLZSJnfQL9B4lMzDzFcOLOVAYXKDEAp4sZI88xVMb/qgbx69ZRXkY7n3pAbHBlw7ORgaEntgLrRsQS7QkgYZ/CK20p109nXCB6rdJLhGqg3i+3esgMLs+IIVYmRzVcHJTWKOuJIebKHj8YzrSXavBrRiuyh3iTUz8/Fh4W6xR8MrhjOAJL2zR+6s0QpVzcMqr8EtcxVO7SwdbtPIl5DOQQcJKtDknShNhZXt7Ej3+BJklWaDwjhbaIWC0KyoF1yfHfh8Fycotn3fv8rSjB2i6gR4NqZtFQOWN9XP84iDAJqyqoa/kr7b3mxndXtwI2D9msBoLDKaH31FzGcXgOGNzumo=:rw/9/459/gyKMOKAGSMzkA==:0dDSdoSv0snmiMqY+HdLAA==
~~~

Uploading the candidate:

[//]: # (shell)
~~~
einstein:/% einstein create candidate.yaml
Uploaded to /candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0

einstein:/% einstein create true_candidate.yaml
Uploaded to /candidates/c5p7erbteda74xb5bxhp2vk4d5j62x3578rjwc0

einstein:/% einstein create false_candidate.yaml
Uploaded to /candidates/c5p7erbted362v3kcnfp6rbechmp8rbmcmx32bhg

einstein:/% einstein list candidates
image                         name            owner    created                 
true_or_false_candidate:1.0   True_Or_False   Mike     2020-01-07T04:09:18.721Z
alwaysTrue_candidate:1.0      Always_True     Briana   2020-01-07T04:09:18.721Z
alwaysFalse_candidate:1.0     Always_False    Noel     2020-01-07T04:09:18.721Z
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
name   candidateId   benchmarkId   suiteId   created

einstein:/% # wait 20 seconds for run to complete ...
einstein:/% einstein list runs
name         candidateId                   benchmarkId                   suiteId         created                 
445422927    alwaysTrue_candidate:1.0      true_or_false_benchmark:1.0   True_Or_False   2020-01-29T22:59:06.754Z
4247377674   alwaysFalse_candidate:1.0     true_or_false_benchmark:1.0   True_Or_False   2020-01-29T22:59:06.755Z
2606945875   true_or_false_candidate:1.0   true_or_false_benchmark:1.0   True_Or_False   2020-01-29T22:59:12.752Z
~~~

Examining run results:

[//]: # (shell)
~~~
einstein:/% einstein results true_or_false_benchmark:1.0
candidateId                   suiteId         created                    passed   failed
alwaysTrue_candidate:1.0      True_Or_False   2020-01-29T22:59:06.754Z   21       26    
alwaysFalse_candidate:1.0     True_Or_False   2020-01-29T22:59:06.755Z   13       34    
true_or_false_candidate:1.0   True_Or_False   2020-01-29T22:59:12.752Z   43       4     
~~~

The result table was created by crawling the runs-blobs:

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
candidates/c5p7erbted362v3kcnfp6rbechmp8rbmcmx32bhg
candidates/c5p7erbteda74xb5bxhp2vk4d5j62x3578rjwc0
candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0
logs/b2606945875
logs/b4247377674
logs/b445422927
logs/c2606945875
logs/c4247377674
logs/c445422927
logs/lab
logs/repository
runs/r2606945875
runs/r4247377674
runs/r445422927
suites/aht7ataz9xt5yhk1dhtpa

einstein:/% cloud more runs/*
=== Contents of /runs/r445422927 ===
kind: Run
apiVersion: 0.0.1
runId: '445422927'
candidateId: 'alwaysTrue_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: '445422927'
description: foo
owner: foo
created: '2020-01-29T22:59:06.754Z'
data:
  passed: 21
  failed: 26


=== Contents of /runs/r4247377674 ===
kind: Run
apiVersion: 0.0.1
runId: '4247377674'
candidateId: 'alwaysFalse_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: '4247377674'
description: foo
owner: foo
created: '2020-01-29T22:59:06.755Z'
data:
  passed: 13
  failed: 34


=== Contents of /runs/r2606945875 ===
kind: Run
apiVersion: 0.0.1
runId: '2606945875'
candidateId: 'true_or_false_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: '2606945875'
description: foo
owner: foo
created: '2020-01-29T22:59:12.752Z'
data:
  passed: 43
  failed: 4
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
benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
candidates/c5p7erbted362v3kcnfp6rbechmp8rbmcmx32bhg
candidates/c5p7erbteda74xb5bxhp2vk4d5j62x3578rjwc0
candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0
logs/b2606945875
logs/b4247377674
logs/b445422927
logs/c2606945875
logs/c4247377674
logs/c445422927
logs/lab
logs/repository
runs/r2606945875
runs/r4247377674
runs/r445422927
suites/aht7ataz9xt5yhk1dhtpa
~~~

## Managing VMs

The persona for this section is the `Data Scientist`.

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

~~~
einstein:/% 
bye

~~~