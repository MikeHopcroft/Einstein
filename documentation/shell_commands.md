# Shell Commands

Here's a cheat sheet for the shell commands:

* Local storage
    * ls \<path> - show pre-populated configuration files
    * cd \<path>
    * **NOT IMPLEMENTED:** pushd \<path>
    * **NOT IMPLEMENTED:** popd \<path>
    * pwd
    * more \<path>
* Cloud storage - not available to end-users
    * cloud ls \<path>
    * **NOT IMPLEMENTED:** cloud cd \<path>
    * **NOT IMPLEMENTED:** cloud pwd
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
