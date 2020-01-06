# Einstein Shell Tutorial

Einstein provides an interactive shell for trying out concepts in a self-contained, simulated cloud environement that runs on the local machine. This tutorial introduces the `Shell` and then walks through the process of

* Deploying the `Einstein Service`
* Uploading a `Benchmark`
* Uploading a `Suite`
* Uploading a `Candidate`
* Running a `Suite` for a `Benchmark` on a specified `Candidate`
* Examining the results of the `Run`


After building Einstein, invoke the shell as follows:
~~~
% node build/applications/shell.js
~~~

When the shell starts up, it prints a welcome message. Typing `"help"` at this point will list the available commands:
[//]: # (shell)
~~~
Welcome to the Einstein interactive command shell.
Type commands below.
A blank line exits.

Type "help" for information on commands.

einstein:/% help
help: command not found
einstein:/% cd a
einstein:/a% cd b
einstein:/a/b% pwd
/a/b
~~~

## Heading 1

Here is some more content.

[//]: # (shell)
~~~
einstein:/a/b% services
no services running
einstein:/a/b% einstein deploy lab
Deploying to lab.
einstein:/a/b% services
no services running
einstein:/a/b% # wait 1 seconds for service to start ...
einstein:/a/b% services
no services running
~~~

The end.

~~~
einstein:/a/b% 
bye

~~~