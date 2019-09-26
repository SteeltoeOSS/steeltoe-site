---
title: Tooling
order: 190
date: 2019/9/24
tags:
---
Steeltoe Tooling simplify the process of running and deploying Steeltoe applications.  With tooling you can, with a few commands, run your application locally and then deploy to Kubernetes or Cloud Foundry.

There are 3 basic steps when using Steeltoe Tooling:

1. initialize Steeltoe Tooling configuration defaults
1. add an application and its services to the configuration
1. deploy the application and its services locally, to Kubernetes, or to Cloud Foundry

# 1.0 Getting Started

## 1.1 Install Steeltoe Tooling

Steeltoe Tooling is a [DotNet Global Tools](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools) console executable named `st`.  Use `dotnet tool install` to install.

```sh
$ dotnet tool install --global --version 1.0.0-m1 Steeltoe.Cli
```

## 1.2 Add DotNet Global Tools to your PATH

DotNet Global Tools are installed in an OS-dependent user directory.

|OS|Path|
|---|---|
|Windows|`%USERPROFILE%\.dotnet\tools`|
|OS X/Linux|`$HOME/.dotnet/tools`|

After adding of the above paths to your `PATH` env var, you can run the `st` executable.

```sh
$ st --version
1.0.0-m1
```
# 2.0 Using

## 2.1 Initialization

The `st init` command initializes your project for Steeltoo Tooling.  Enter your project directory and run the command.

```sh
$ cd MyProject
$ st init
Initialized Steeltoe Developer Tools
```

Running `st init` creates the file `steeltoe.yaml` in your project directory.  Steeltoe Tooling uses this file to determine what application and services are to be deployed and where to deploy them.

## 2.2 Application and Services

The `st add` and `st remove` commands add and remove applications and services to the Steeltoo Tooling configuration.

### 2.2.1 Adding an Application

Running `st add app <appname>` adds an application to the configuration. _appname_ must correspond to a `.csproj` file of the same name.

```sh
$ st add app MyProject
Added app 'MyProject'
```

### 2.2.2 Adding a Service

Running `st add <svctype> <svcname>` adds a service to the configuration.

Supported service types include:

|Service Type|Description|
|---|---|
|config-server|Cloud Foundry Config Server|
|eureka-server|Netflix Eureka Server|
|hystrix-dashboard|Netflix Hystrix Dashboard|
|mssql|Microsoft SQL Server|
|mysql|MySQL Server|
|postgresql|PostgreSQL Server|
|rabbitmq|RabbitMQ Message Broker|
|redis|Redis In-Memory Datastore|
|zipkin|Zipkin Tracing Collector and UI|

```sh
$ st add config-server MyConfigServer
Added config-server service 'MyConfigServer'
```

### 2.2.3 Removing an Application or Service

Running `st remove <name>` removes the named application or service.

```sh
$ st remove myConfigServer
Removed config-server service 'myConfigServer'
```

## 2.3 Deployment

### 2.3.1 Setting the Target

Running `st target <target>` targets a deployment.

Supported targets include:

|Target|Deployment Destination|
|---|---|
|cloud-foundry|current Cloud Foundry space|
|docker|local Docker host|
|kubernetes|current Kubernetes context|

```sh
$ st target kubernetes
Kubernetes ... kubectl client version 1.14, server version 1.14
current context ... docker-desktop
Target set to 'kubernetes'
```

### 2.3.1 Deploying

Running `st deploy` deploys an application and its services to the current target.

```sh
$ st deploy
Deploying service 'myConfigServer'
Waiting for service 'myConfigServer' to come online (1)
Waiting for service 'myConfigServer' to come online (2)
Deploying app 'SimpleCloudFoundry'
```

### 2.3.2 Undeploying

Running `st undeploy` undeploys an application and its services from the current target.

```sh
$ st undeploy
Undeploying app 'SimpleCloudFoundry'
Undeploying service 'myConfigServer'
```

# 3.0 Sample Walkthrough

In this sample we use Steeltoe Tooling to simplify the process of deploying the Steeltoe Sample SimpleCloudFoundy project to various targets.

## 3.1 Initialize the SimpleCloudFoundry Project Dev Environment

Checkout Steeltoe Samples and navigate to the SimpleCloudFoundry project.

```sh
$ git clone https://github.com/SteeltoeOSS/Samples.git
$ cd Samples/Configuration/src/AspDotNetCore/SimpleCloudFoundry
```

Initialize Steeltoe Tooling.

```sh
$ st init
Initialized Steeltoe Developer Tools
```

## 3.2 Add the Application and Service

Add application.
```sh
$ st add app SimpleCloudFoundry
Added app 'SimpleCloudFoundry'
```

Add service.
```sh
$ st add config-server myConfigServer
Added config-server service 'myConfigServer'
```

## 3.3 Deploy

### 3.3.1 Deploy Locally

Before deploying to a remote cloud, first run locally using Docker ...

```sh
$ st target docker
Docker ... Docker version 18.09.1, build 4c52b90
Docker host OS ... Docker for Mac
Docker container OS ... linux
Target set to 'docker'

$ st deploy
Deploying service 'myConfigServer'
Deploying app 'SimpleCloudFoundry'
```

... check status ...

```sh
$ st status
myConfigServer online
SimpleCloudFoundry online
```

... then navigate to application ...

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<http://localhost:8080/>

... finally, undeploy.

```sh
$ st undeploy
Undeploying app 'SimpleCloudFoundry'
Undeploying service 'myConfigServer'
```

### 3.3.2 Deploy to Cloud Foundry

Deploy to Cloud Foundry ...

```sh
$ st target cloud-foundry
Cloud Foundry ... cf version 6.46.0+29d6257f1.2019-07-09
logged into Cloud Foundry ... yes
Target set to 'cloud-foundry'

$ st deploy
...
```

... and undeploy.

```sh
$ st undeploy
Undeploying app 'SimpleCloudFoundry'
Undeploying service 'myConfigServer'
```

### 3.3.3 Deploy to Kubernetes

Deploy to Kubernetes ...

```sh
$ eval $(minikube docker-env)  # if using minikube's Docker

$ st target kubernetes
Kubernetes ... kubectl client version 1.15, server version 1.15
current context ... minikube
Target set to 'kubernetes'

$ st deploy
...
```

... and undeploy.

```sh
$ st undeploy
Undeploying app 'SimpleCloudFoundry'
Undeploying service 'myConfigServer'
```
