---
title: Introduction
date: 2016/6/1
tags:
---

Steeltoe is an [open source project](https://github.com/SteeltoeOSS) aimed at taking the tremendously useful set of tools from Netflix and others and making them available to the .NET community. It was built to work with .NET Core as well as .NET 4.x.  Additionally, most of these components work stand-alone (e.g., on  your local computer) as well as on Cloud Foundry, the leading multi-cloud application platform. 

Steeltoe builds on Spring Cloud by providing several packages that enable .NET developers to leverage the tools developers can use to build some of the common patterns (e.g. centralized configuration management, service discovery, circuit breakers, etc. ) found in highly scalable, resilient distributed systems. Using Steeltoe, together with Spring Cloud, developers are able to quickly standup micro-services and applications that implement these patterns. 

Steeltoe provides services that can be categorized into two broad categories.

Services that simplify using .NET and ASP.NET on Cloud Foundry:

* Connectors (e.g. MySql, Redis, Postgres, RabbitMQ, OAuth, etc)
* Configuration providers
* Security providers (OAuth SSO, JWT, Redis Key Ring Storage, etc.)

Services that enable .NET and ASP.NET developers to leverage Spring Cloud:

* Configuration Server client 
* Service Discovery client

### 1.0 Getting Started
If you plan on developing applications using Steeltoe, you will need to download and install the latest [.NET Core SDK 1.1](https://www.microsoft.com/net/download/core). 

Additionally, while not required, it is recommended to install one of the development tools [Visual Studio](https://www.visualstudio.com/) or [Visual Studio Code](https://code.visualstudio.com/) provided by Microsoft.

If you are new to [.NET Core](https://docs.microsoft.com/en-us/dotnet/articles/core/) or [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/), we recommend you first spend time working through some of the Microsoft [tutorials](https://docs.microsoft.com/en-us/aspnet/core/getting-started).

Note: The Steeltoe packages can also be used in .NET Framework and ASP.NET 4 based applications. You are not required to target .NET/ASP.NET Core when using Steeltoe.

#### 1.1 NuGet Feeds
When developing applications using Steeltoe, whether on .NET Core or .NET Framework, you will need to pull into your application the Steeltoe packages.

To use the latest releases of Steeltoe, you can subscribe to any one of the following feeds, depending on your needs:

[Release or Release Candidates](https://www.nuget.org/) - https://www.nuget.org/

[Pre-release - Stable](https://www.myget.org/gallery/steeltoemaster) - https://www.myget.org/gallery/steeltoemaster

[Development - Less Stable](https://www.myget.org/gallery/steeltoedev) - https://www.myget.org/gallery/steeltoedev

Below is an example NuGet.config file you can edit and use when developing applications using Steeltoe.  Note that if you only want to use release or pre-released versions of Steeltoe, you do not need to make any changes to your NuGet.config file, as those are served from `nuget.org`.

```
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="SteeltoeMaster" value="https://www.myget.org/F/steeltoemaster/api/v3/index.json" />
    <add key="SteeltoeDev" value="https://www.myget.org/F/steeltoedev/api/v3/index.json" />
    <add key="NuGet" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
</configuration>
```

#### 1.2 Quick Starts

For many of the Steeltoe services, we provide a Quick Start sample and guide that describe how to quickly get a sample application up and running using a particular Steeltoe service. A detailed break down of the sample code is provided, describing how the Steeltoe service has been integrated into the app.

In many cases, these guides provide two ways of exercising the applications; one that describes how to create and run the application locally on your development machine, and a second that describes getting the application up and running on CloudFoundry. 

For the Quick Starts in which we run the application locally, we will at times make use of Java in order to run instances of the dependent servers (e.g. Config Server, Eureka Server, etc.) locally on your machine. As such if you don't have Java available on your machine you might want to install that now.  

For the Quick Starts in which we make use of CloudFoundry, you will need to acquire access to a CloudFoundry environment and also an environment which has the appropriate services (e.g. Config Server, Eureka, etc) installed. One possible source is [PCF Dev](https://docs.pivotal.io/pcf-dev/); depending on your desktop operating system and its configuration, you may or may not be able to make use of it.  PCF Dev uses Virtual Box, and depending on what other virtualization you are using or have installed, PCF Dev may or may not work for you.  

Also, when working with Cloud Foundry, you will also need to install the [Cloud Foundry Command Line Interface (CLI)](https://github.com/cloudfoundry/cli/releases) in order to interact with the runtime. 

In doing all of the Quick Starts, you will need the GIT command line tools installed on your machine. This is required in order to for you to get and work with the Quick Start sample code we have provided.

### 2.0 Release Notes

#### 2.1 Discovery

##### Eureka Version
Steeltoe has implemented a [Eureka 1.0 client](https://github.com/Netflix/eureka/wiki), not a 2.0 client. Eureka 2.0 is expected to have significant updates to its architecture and public API. At some point in time, we will examine a 2.0 implementation.

##### Eureka AWS Support 
The Eureka client for Java contains features which enable operation on AWS.  The Steeltoe version does not currently implement those features, and instead, this version has been optimized for CloudFoundry environments. We will look at adding AWS cloud features at a future point in time.

##### Eureka Client Configuration
Not all configuration properties found in the Java client are available for configuration. Those that are supported and provided by the Steeltoe implementation have been documented within.

#### 2.2 Configuration

##### Config Server - Unstructured data files
Unlike the Java version of the Config Server client, the Steeltoe client currently only supports property and yaml files; not plain text.

##### Config Server - Client decryption option
Steeltoe client only supports clear text communication with the configuration server, unless SSL/TLS is being used between the client and server. Client decryption is on our road map, but not currently supported. 

##### Config Server initiated reload
Currently reloads must be initiated by the client, Steeltoe has not implemented handlers to listen for server change events.  These changes are expected to be added in the future.