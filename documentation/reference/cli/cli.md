# Einstein CLI

## Commands

### Deploying Einstein

Chicken and egg problem with deployment secrets:
* Want to use `einstein encrypt` to encrypt secrets in deployment manifest.
* Can't run `einstein encrypt` until we're connected with a deployment that provides a public key.

Deployment manifest for Azure:
~~~
azure:
    credentials:
        secret: xyz
~~~

Deployment manifest for local Docker Compose:
~~~
docker:
    (TBD...)
~~~

~~~
% einstein deploy <deployment manifest>
~~~

~~~
% einstein show publickey
~~~

### Connecting the CLI to a specific deployment

~~~
% einstein connect <deployment>
~~~

### Submitting Candidates

~~~
% einstein encrypt <text>
~~~

~~~
name: MyCandidateName
description: A brief description of the candidate.
tags:
    - tag1
    - tag2
submitter: MyAlias
image: myContainerImage
services:
  - http://service1
  - http://service2
~~~

~~~
% einstein candidate <candidate manifest>
~~~

### Creating Benchmarks

~~~
name: MyBenchmarkName
description: A brief description of the benchmark.
tags:
    - tag1
    - tag2
submitter: MyAlias
image: myBenchmarkImage
~~~

~~~
% einstein benchmark <benchmark manifest>
~~~

### Adding Test Suites to Benchmarks

ISSUE: should suites have versions?
~~~
name: MySuiteName
description: A brief description of the suite.
submitter: MyAlias
tags:
    - tag1
    - tag2
benchmark: BenchmarkName
tests:
    <benchmark-defined section>
~~~

~~~
% einstein suite <suite manifest>
~~~

### Running a Test

~~~
% einstein run <candidate> <suite>
~~~

### Listing Candidates, Benchmarks, Suites, Series, Runs

~~~
% einstein list [candidates|benchmarks|suites|series|runs] <regex>
~~~

### Examining Candidates, Benchmarks, Suites, Series, Runs

ISSUE: may want to lock down access to suites so that contestants can't preview test cases.

FEATURE: might want a web server that provides benchmark documentation HTML.

~~~
% einstein show [candidate|benchmark|suite|series|run] <name>
~~~
