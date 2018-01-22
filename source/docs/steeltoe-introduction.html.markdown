---
title: Introduction
order: 10
date: 2018/1/21
tags:
---

Steeltoe is an [open source project](https://github.com/SteeltoeOSS) aimed at taking the tremendously useful tools from Netflix and others and making them available to the .NET community. It was built to work with .NET Core as well as .NET Framework 4.x.  Additionally, most of these components work stand-alone (e.g., on  your local computer) as well as on Cloud Foundry, the leading multi-cloud application platform.

Steeltoe builds on Spring Cloud by providing several packages that enable .NET developers to leverage these tools to implement some common patterns (e.g. centralized configuration management, service discovery, circuit breakers, etc. ) found in highly scalable and resilient distributed systems. Using Steeltoe, together with Spring Cloud, developers are able to quickly stand up micro-services and applications that implement these patterns.

Steeltoe provides services that fall broadly into two categories.

Services that simplify using .NET and ASP.NET on Cloud Foundry:

* Connectors (e.g. MySql, Redis, Postgres, RabbitMQ, OAuth, etc)
* Configuration providers
* Security providers (OAuth SSO, JWT, Redis Key Ring Storage, etc.)
* Logging providers

And services that enable .NET and ASP.NET developers to leverage Spring Cloud:

* Configuration Server client
* Service Discovery client
* Hystrix Circuit Breaker
* Management endpoints

# 1.0 Getting Started

If you plan on developing applications using Steeltoe, you will need to download and install the latest [.NET Core SDK](https://www.microsoft.com/net/download/core).

Additionally, while not required, it is recommended that you install one of the development tools [Visual Studio](https://www.visualstudio.com/) or [Visual Studio Code](https://code.visualstudio.com/) provided by Microsoft.

If you are planning to develop using [.NET Core](https://docs.microsoft.com/en-us/dotnet/articles/core/) or [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/), we recommend you first spend time working through some of the following tutorials from Microsoft:

* [Getting Started with ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/getting-started)
* [Getting Started with C#](https://www.microsoft.com/net/tutorials/csharp/getting-started)

Note: Many of the Steeltoe packages can also be used with .NET Framework and ASP.NET 4 based applications. You are not required to target .NET/ASP.NET Core when using Steeltoe.

## 1.1 NuGet Feeds

When developing applications using Steeltoe, whether on .NET Core or .NET Framework, you will need to pull the Steeltoe NuGet packages into your application.

To use the latest releases of Steeltoe, you can subscribe to any one of the following feeds, depending on your needs:

* [Release or Release Candidates](https://www.nuget.org/profiles/steeltoe)
* [Pre-release - Stable](https://www.myget.org/gallery/steeltoemaster)
* [Development - Less Stable](https://www.myget.org/gallery/steeltoedev)

Below is an example NuGet.config file you can edit and use when developing applications using Steeltoe.  Note that if you only want to use release or pre-release (RC) versions of Steeltoe, you do not need to make any changes to your NuGet.config file, as those are served from `nuget.org`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="SteeltoeMaster" value="https://www.myget.org/F/steeltoemaster/api/v3/index.json" />
    <add key="SteeltoeDev" value="https://www.myget.org/F/steeltoedev/api/v3/index.json" />
    <add key="NuGet" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
</configuration>
```

## 1.2 Quick Starts

For many of the Steeltoe components, we provide Quick Start samples and a guide that describes how to quickly get a sample application up and running using a particular Steeltoe component. A detailed breakdown of the sample code is provided, describing how Steeltoe has been integrated into the app.

In many cases, these guides provide two ways of exercising the applications: one that describes how to create and run the application locally on your development machine, and a second that describes running the application on Cloud Foundry.

For the Quick Starts in which we run the application locally, Java is required to run instances of some of the servers (e.g. Spring Cloud Config Server, Netflix Eureka Server, etc.) on your machine. If you don't have Java available on your machine you may want to install that now.

For the Quick Starts running on Cloud Foundry, you will need access to a Cloud Foundry environment that has the appropriate services  (e.g. Spring Cloud Config Server, Netflix Eureka Server, etc.) installed. One option is to run [PCF Dev](https://docs.pivotal.io/pcf-dev/), the local developer version of Pivotal Cloud Foundry on your development machine. PCF Dev makes use of  Virtual Box, so depending on your desktop operating system and configuration you may or may not be able to make use of it.

Alternatively, you can sign up for a free trial account of [Pivotal Web Services](https://run.pivotal.io/) the hosted multi-tenant edition of [Pivotal Cloud Foundry](https://pivotal.io/platform). Note that if you want to work solely with .NET framework applications that target the Windows operating system, you'll likely need access to a corporate Cloud Foundry environment, as neither of the above options currently support deploying Windows apps.

Regardless of which Cloud Foundry option you choose, in order to work with Cloud Foundry, you will need to install the [Cloud Foundry Command Line Interface (CLI)](https://github.com/cloudfoundry/cli/releases).

Finally, for all of the Quick Starts, you will need to install the [GIT command line tools](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) so you can fetch the Quick Start sample code and work with it on your computer.

# 2.0 Release Notes

A large focus of Steeltoe version 2.0 is compatibility with .NET Standard 2.0. As part of this initiative, virtually all packages have been reorganized and renamed to minimize hard dependencies on other libraries and also help differentiate between packages with full-framework support and those for .NET Core. Most Steeltoe libraries now include a package ending with "Base" that provides the majority of the functionality. Packages ending with "Core" provide extra methods for working with Microsoft's Dependency Injection Framework, with the naming intended to coincide with .NET Core development. Full-framework support to date has been focused on Autofac, relevant Steeltoe packages have names ending in "Autofac".

## 2.1 CircuitBreaker

As described in the general release notes above, these are now the names of the Steeltoe Circuit breaker packages: `Steeltoe.CircuitBreaker.HystrixBase`, `Steeltoe.CircuitBreaker.HystrixCore`, `Steeltoe.CircuitBreaker.HystrixAutofac`, `Steeltoe.CircuitBreaker.Hystrix.MetricsEventsCore` and `Steeltoe.CircuitBreaker.Hystrix.MetricsStreamCore`.

## 2.2 Common

New for Steeltoe 2.0 is a set of libraries with code shared between our libraries. You're welcome to use this code as well, but these libraries are not likely to receive much attention in this documentation.

## 2.3 Configuration

In Steeltoe version 1.x, there are 3 packages for Configuration. As of 2.0.0, each of those packages now has a &ast;Base, &ast;Core and &ast;Autofac (eg: `Steeltoe.Extensions.Configuration.ConfigServerBase`, `Steeltoe.Extensions.Configuration.ConfigServerCore`, etc) for a total of 9 packages. Be sure to use the `Pivotal.&ast;` packages if you are deploying your application to Pivotal Cloud Foundry.

### Config Server Settings

Starting with version 1.1.0 of Steeltoe, you can now configure the timeout value the Steeltoe client uses when making Http requests of the Config Server.

### Config Server Vault support

Starting with version 1.1.0 of Steeltoe, the Config Server client is compatible with Spring Cloud and Spring Cloud Services Config Server deployments which support using Hashicorp Vault as back-ends.

### Known Issues

#### Unstructured data files

Unlike the Java version of the Config Server client, the Steeltoe client currently only supports property and yaml files, not plain text.

#### Client decryption option

Steeltoe client only supports clear text communication with the configuration server, unless SSL/TLS is being used between the client and server. Client decryption is on our road map, but not currently supported.

#### Server initiated reload

Currently reloads must be initiated by the client, Steeltoe has not implemented handlers to listen for server change events. However this feature is expected to be added in the future.

## 2.4 Connectors

As of version 2.0.0, all of the individual connectors have been rolled up into a single package: `Steeltoe.CloudFoundry.ConnectorBase`. Helper methods for ASP.NET Core/Microsoft DI have been moved to `Steeltoe.CloudFoundry.ConnectorCore`, `Steeltoe.CloudFoundry.Connector.EF6Core` (Entity Framework 6) and `Steeltoe.CloudFoundry.Connector.EFCore` (Entity Framework Core). Version 2.0.0 now includes a Microsoft SQL Server Connector, and classes and namespaces related to RabbitMQ have been renamed from `*Rabbit` to `*RabbitMQ`

### MySql Connector

Starting with version 1.0.1 of Steeltoe, the direct dependency on all of Oracle's MySql packages have been removed.  This has allowed the connector to become more flexible in terms of which MySql ADO.NET providers and versions it supports. With this release the connector is able to work with [Oracle's MySql Provider](https://dev.mysql.com/downloads/connector/net/) and the open source [MySqlConnector](https://mysql-net.github.io/MySqlConnector/) providers.

Additionally, as it relates to Entity Framework support, the connector has been updated to support [Oracle's Entity Framework Provider](https://dev.mysql.com/downloads/connector/net/) and the open source [Pomelo Entity Framework Provider](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql).

For more detail on how to use these, see the MySql connector documentation. Note: This is a BREAKING change, as it now requires that you MUST explicitly include the packages and versions of the MySql/Entity framework code you wish to use in your application.

### Postgres Connector

Starting with version 1.0.1 of Steeltoe, the direct dependency on the open source Npgsql package has been removed.  This has allowed the connector to become more flexible in what Postgres ADO.NET providers and versions it supports.

For more detail on how to use the connector see the Postgres connectors documentation. NOTE: This is a BREAKING change, as it now requires that you MUST explicitly include the packages and versions of the Postgres/Entity framework code wish to use in your application.

### RabbitMQ Connector

Starting with version 1.0.1 of Steeltoe, the direct dependency on the open source RabbitMQ Client package has been removed.  This has allowed the connector to become more flexible in what version of the client it supports.

For more detail on how to use the connector see the RabbitMQ connectors documentation. NOTE: This is a BREAKING change, as it now requires that you MUST explicitly include the packages and versions of the RabbitMQ code you wish to use in your application.

Also with this release, the connector has been updated to properly work with SSL/TLS based connections.  Prior to this release, the connector did not support using the 'amqps' URL scheme.

### Redis Connector

Starting with version 2.0.0 of Steeltoe, the direct dependencies on Redis packages have been removed. The Steeltoe connector works with the StackExchange libraries or `Microsoft.Extensions.Caching.Redis`. You include the package and version you prefer and use the appropriate methods to wire it up. See the Redis Connector documentation for more information.

## 2.5 Discovery

In version 1.x of Steeltoe, there were 3 packages, in version 2.0.0 there are 9: `Steeltoe.Discovery.ClientAutofac`, `Steeltoe.Discovery.ClientCore`, `Steeltoe.Discovery.Eureka.Client`, `Pivotal.Discovery.ClientCore`, `Pivotal.Discovery.ClientAutofac`, `Pivotal.Discovery.Eureka.Client`. Be sure to use the `Pivotal.&ast;` packages if you are deploying your application to Pivotal Cloud Foundry. Version 2.0.0 also includes support for dynamic update of configuration options.

### Eureka Version

Steeltoe has implemented a [Eureka 1.0 client](https://github.com/Netflix/eureka/wiki), not a 2.0 client. Eureka 2.0 is still a work in progress and is expected to have significant updates to its architecture and public API. At some point in time, we will examine a 2.0 implementation.

### Eureka AWS Support

The Eureka client for Java contains features which enable operation on AWS.  The Steeltoe version does not currently implement those features. Instead, this version has been optimized for Cloud Foundry environments. We may look at adding AWS cloud features at a future point in time.

### Eureka Client Configuration

Not all configuration properties found in the Java client are available for configuration. Those that are supported and provided by the Steeltoe implementation have been documented within.

### Cloud Foundry C2C Support

Starting with version 1.1.0 of Steeltoe, the Steeltoe Eureka client allows you to configure what hostname/address gets registered with the Eureka server for your service registrations.  This is provided by using a new setting, `spring:cloud:discovery:registrationMethod`.  By using this setting, you can now make use of Cloud Foundry Container to Container (C2C) networking support.

## 2.6 Logging

As of version 2.0.0, `Steeltoe.Extensions.Logging.CloudFoundry` is now called `Steeltoe.Extensions.Logging.DynamicLogger`

## 2.7 Management

As of version 2.0.0, all of the individual management endpoints have been rolled up into a single package: `Steeltoe.Management.EndpointBase`. Helper methods for ASP.NET Core/Microsoft DI have been moved to `Steeltoe.Management.EndpointCore`, convenience helpers to set up all endpoints at once are available in `Steeltoe.Management.CloudFoundryCore`. Additionally in 2.0.0, actuators identify themselves to PCF as Steeltoe, resulting in a Steeltoe icon in Pivotal Apps Manager and certificate validation can be disabled on management endpoints.

## 2.8 Security

New features for Steeltoe Security 2.0.0 include a client for [CredHub](https://github.com/cloudfoundry-incubator/credhub), support for using CloudFoundry as an authentication provider in .NET Framework 4.x applications and a JWT Provider for WCF applications.