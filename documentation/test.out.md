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
Depoying einstein Laboratory to lab
Depoying einstein Repository to repository

einstein:/% services
no services running
~~~

Wait a few seconds and check services again. Can see that the host lab is running the Einstein service on port 8080.

[//]: # (shell)
~~~
einstein:/% # wait 10 seconds for service to start ...
einstein:/% services
image            host         port
repository:1.0   repository   8080
labratory:1.0    lab          8080
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
lab: laboratory: starting up
lab: laboratory: fully initialized
lab: Labratory service running at lab:8080


einstein:/% cloud more logs/repository
repository: Repository.entryPoint()
repository: starting up
repository: fully initialized
repository: Initializing
repository: Repository service running at repository:8080
repository: Initialization complete
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
repository:1.0
~~~

Shell also pre-provisions yaml configuration files:

[//]: # (shell)
~~~
einstein:/% ls
benchmark.yaml
candidate.yaml
false_candidate.yaml
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
data:
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
data:
  password:
    secret: >-
      lVGEWLMWSoU+IiycH04rNhytCKr3zcVoily1jCZiU8lHI1deqebATqF/VUYzE/jUDCF4QSwunJmILPbeVhymS8HUMm+I35xPCe5d3e3LDPGnp6AmpvFNLW4BwFmsRe5mTlBdDFJfrD8JeLfUQKXJi7m6eztHC3yazHKaqM3jaAGt5Cm0HwPyFD0CWcuA18asjFoOWaYMPRqsk/OPYGLXik8+YS2IeR5yZPwAOQ2Q/4kfBF2CVLXMjehjTOF/+UtISB/A9f8j27hq5dawk+uwvQGRkrKPfS3xH4p3cNujuOUSQ9qh8T+Z+Ulrk0V7etM3iGlSTPpygL7DDnHu42UZO45Hm3/ZPMp/oIlel2pkPXIO/1zokPM6kyXSlUGQtBEfhc1JS9SEPyfMBS5HoXrHeyr/H+VtosxVzaUza+Okph6tzpFXsFqiYhxrt2WlCGMqGf0zcz5y+fLr2h7vtiXKQJVBRMkdieiMBIl3MIGbPIvmvE2RsS9GmSi9jR/6vOSBU05XBJz3wm+Q9gGEBAUbJCwaXeKpH2OfI6m/umlN9A94lvm8mLuB12wwh8LT34aNYNQtBdTtH6L9xYhXlARw8JGKqdYUvvhPgo3PFv+QujgULFt0XVBPJZXR1oGTyuNycqiYKPNcVYMVl/pmJSw0McRGUOPJhRuCDry+w56ABak=:oXGAR7ZKSMG+Bix58CzvEA==:+mBtmlu4rDQMFkpgEvnWpg==
whitelist:
  - 'http://www.wikipedia.org'
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
name   candidate   benchmark   suite   date

einstein:/% # wait 20 seconds for run to complete ...
einstein:/% einstein list runs
name                                   candidate                     benchmark                     suite           date                    
0d62d9b8-b6a3-419d-90dc-7f96c2bbd259   alwaysTrue_candidate:1.0      true_or_false_benchmark:1.0   True_Or_False   2020-01-21T06:49:49.641Z
0090d896-1f2f-421e-9f55-056812062435   alwaysFalse_candidate:1.0     true_or_false_benchmark:1.0   True_Or_False   2020-01-21T06:49:49.654Z
3df7ae93-4b57-44f6-9793-5c8c29659f21   true_or_false_candidate:1.0   true_or_false_benchmark:1.0   True_Or_False   2020-01-21T06:49:54.632Z
~~~

Examining run results:

[//]: # (shell)
~~~
einstein:/% einstein results true_or_false_benchmark:1.0
candidateId                   suiteId         created                    passed   failed
alwaysTrue_candidate:1.0      True_Or_False   2020-01-21T06:49:49.641Z   21       26    
alwaysFalse_candidate:1.0     True_Or_False   2020-01-21T06:49:49.654Z   13       34    
true_or_false_candidate:1.0   True_Or_False   2020-01-21T06:49:54.632Z   43       4     
~~~

The result table was created by crawling the runs-blobs:

[//]: # (shell)
~~~
einstein:/% cloud ls
benchmarks/eht7atazdxt5ytk1dhtpaqv2cnq66u3dc5t6pehh5rr0
candidates/c5p7erbted362v3kcnfp6rbechmp8rbmcmx32bhg
candidates/c5p7erbteda74xb5bxhp2vk4d5j62x3578rjwc0
candidates/eht7atazdxt5ytk1dhtpaqv3c5q68ub4c5u6aehh5rr0
logs/0090d896-1f2f-421e-9f55-056812062435
logs/0d62d9b8-b6a3-419d-90dc-7f96c2bbd259
logs/3df7ae93-4b57-44f6-9793-5c8c29659f21
logs/794c9e7d-afae-4dd8-9e87-77b832c1e071
logs/8ca8a6d6-5653-4404-87ed-3b567a78ef57
logs/f422a029-44ac-455c-9e54-44a29a4d38ca
logs/lab
logs/repository
runs/0090d896-1f2f-421e-9f55-056812062435
runs/0d62d9b8-b6a3-419d-90dc-7f96c2bbd259
runs/3df7ae93-4b57-44f6-9793-5c8c29659f21
suites/aht7ataz9xt5yhk1dhtpa

einstein:/% cloud more runs/*
Contents of /runs/0d62d9b8-b6a3-419d-90dc-7f96c2bbd259:
kind: Run
apiVersion: 0.0.1
runId: 0d62d9b8-b6a3-419d-90dc-7f96c2bbd259
candidateId: 'alwaysTrue_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: foo
description: foo
owner: foo
created: '2020-01-21T06:49:49.641Z'
data:
  passed: 21
  failed: 26


Contents of /runs/0090d896-1f2f-421e-9f55-056812062435:
kind: Run
apiVersion: 0.0.1
runId: 0090d896-1f2f-421e-9f55-056812062435
candidateId: 'alwaysFalse_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: foo
description: foo
owner: foo
created: '2020-01-21T06:49:49.654Z'
data:
  passed: 13
  failed: 34


Contents of /runs/3df7ae93-4b57-44f6-9793-5c8c29659f21:
kind: Run
apiVersion: 0.0.1
runId: 3df7ae93-4b57-44f6-9793-5c8c29659f21
candidateId: 'true_or_false_candidate:1.0'
suiteId: True_Or_False
benchmarkId: 'true_or_false_benchmark:1.0'
name: foo
description: foo
owner: foo
created: '2020-01-21T06:49:54.632Z'
data:
  passed: 43
  failed: 4
~~~

## Examining Cloud Storage

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
logs/0090d896-1f2f-421e-9f55-056812062435
logs/0d62d9b8-b6a3-419d-90dc-7f96c2bbd259
logs/3df7ae93-4b57-44f6-9793-5c8c29659f21
logs/794c9e7d-afae-4dd8-9e87-77b832c1e071
logs/8ca8a6d6-5653-4404-87ed-3b567a78ef57
logs/f422a029-44ac-455c-9e54-44a29a4d38ca
logs/lab
logs/repository
runs/0090d896-1f2f-421e-9f55-056812062435
runs/0d62d9b8-b6a3-419d-90dc-7f96c2bbd259
runs/3df7ae93-4b57-44f6-9793-5c8c29659f21
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