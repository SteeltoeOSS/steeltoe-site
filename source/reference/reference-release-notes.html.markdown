---
title: Release Notes
order: 10
date: 2019/1/22
tags: release-notes
---

# Release Candidates

---

## 2.2.0 RC1

The new features in Steeltoe 2.2.0 release candidate

### Connectors

* New MongoDB Connector

### Security

* OpenIDConnect support added
* Refactor of .NET Framework Security
  * Separated common components into Base library
  * Enabled HttpClient injection

### Management

* Enhanced support for Spring Boot 2.0 Actuator Endpoints
  * Actuators in Cloud Foundry can be accessed outside cloudfoundry, while also maintaining AppsManager integration
  * Actuators now have default path /actuator when no path is specified
  * Control the exposure level of actuator endpoints
  * Show Details configuration options for the health endpoint (_always_, _never_, and _when-authorized_)
  * Sanitizing of sensitive information from `/env` actuator endpoint

### Discovery

* Multiple addresses for Eureka servers
* Hashicorp Consul supported added

### Configuration

>Important: The `Pivotal.Extensions.Configuration.ConfigServer*` packages have been deprecated in Steeltoe 2.2 and will be removed in a future release.  All functionality provided in those packages has been pushed into the corresponding `Steeltoe.Extensions.Configuration.ConfigServer*` packages.

* New `Placeholder` configuration provider supporting placeholder resolution
  * Use placeholders like `${key:key1:key2?default_value}` as configuration values
* New `RandomValue` configuration provider supporting random value generation
  * Use keys like `random:int`, `random:long`, `random:uuid`, `random:string`, etc. to access random values
* New `ConfigureCloudFoundryServices<TOption>()` Cloud Foundry extension method for binding `VCAP_SERVICES` configuration data to user defined `C#` objects
* Configuration placeholders can be used when configuring Steeltoe components
* Config Server client supports `Discovery First` configuration
* Config Server client supports HA by allowing multiple config servers URLs to be configured
* New Config Server health check contributor

### Health Contributors

* Config Server health contributor
* Discovery Client health contributor

### Load Balancer

* Client-side load balancer
* Support for random and round-robin load balancer implementations out-of-the-box
* API for custom load balancer implementations
* Integration with Eureka

### Other Features

* Reference Application [eShopOnContainers](https://github.com/SteeltoeOSS/eShopOnContainers) using Steeltoe components
* Released NuGet packages are now signed

# GA Releases

## 2.1.0

The new features in Steeltoe 2.1.0

* Management and Monitoring (M&M’s)
* ASP.NET 4.x
* .NET Core & ASP.NET Core 2.1

### Management

So what’s new in 2.1 Management?

* Additional Spring Boot-compatible endpoints
* Out-of-box health contributors
* Application metrics
* Distributed tracing

#### Additional Spring Boot-compatible Actuator Endpoints

In addition to the existing endpoints in 2.0, we’ve added several new ones.  Each one is available as additional REST endpoints you can expose in your applications:

* /env - returns keys and values from the app configuration.
* /mappings - returns ASP.NET routes and route templates exposed by the application.
* /refresh - causes the apps configuration to be reloaded and returned.
* /metrics - returns current metrics for the app (more on metrics below.)

#### Out-of-box Health Contributors

One of the key Spring Boot-compatible Management endpoints provided in Steeltoe 2.0 was ‘/health’. But, in 2.0 we provided a limited number of out-of-the-box contributors to run health checks. While it was fairly easy to write your own, you still had to do the coding yourself.

So in 2.1 we now include several new contributors which you can easily reference. They include:

* Redis
* RabbitMQ
* MySQL
* Microsoft SQL Server
* Postgres

Each of these new contributors has been added to the Steeltoe Connectors package. This allows you to easily make use of the corresponding health contributor when using a connector.

### Application Metrics

Support for collecting application metrics is completely new this release.  Here's the functionality implemented so far:

* We’ve implemented the OpenCensus Stats APIs for instrumentation. You can also use those APIs in your code to collect your own custom metrics.
* We’ve implemented the OpenCensus Tags APIs for tagging metrics and adding multi-dimensionality to the metrics collected.
* Collect .NET runtime metrics automatically, i.e., heap, thread, and GC usage. Stay tuned for more enhancements in this area, as we build upon the work Microsoft is doing in this area.
* Automatically collect ASP.NET metrics, like request counts,  response times, and others. There’s more to come here as well.
* Automatically collect HttpClient metrics, i.e., request counts, response times, etc.
* Expose metrics via the Spring Boot compatible REST endpoint  ‘/metrics’ (mentioned earlier.)
* For Cloud Foundry users, you can export collected metrics to the Loggregator Firehose using Metrics Forwarder. Just as with Java Spring apps, developers can send their .NET apps metrics to any one of several backend services for collection and reporting, for example, PCF Metrics.

### Distributed Tracing

Also completely new in 2.1 is distributed tracing support. Here's what we're delivering in 2.1:

* Implemented OpenCensus Trace APIs for instrumenting your code.
* Instrumented ASP.NET Core so that spans are automatically started, stopped, or joined at common ingress and egress points.
* Instrumented HttpClient such that traces and spans are joined with already existing spans.
* Add trace and span IDs to the log messages produced by your app so you can use log correlation by trace ID when diagnosing problems.
* Automatically propagate trace context (in Zipkin format) to downstream processes or microservices.
* Provide a Zipkin exporter which you can optionally use to send your captured spans to a backend Zipkin server.

### ASP.NET 4.x

In Steeltoe 2.0, we took first steps to add better 4.x support by enabling the Config Server, Eureka Server, and Connectors to be used within a 4.x application. In 2.1, we have continued that work by adding Steeltoe Security & Management to the list.

With Steeltoe 2.1, you can easily drop the Management endpoints into a 4.x application. We have implemented the endpoints using both OWIN middleware, and by using an HttpModule. You can pick the method that works best for your app. You can configure or add each endpoint individually, or you can add them all.

Since Steeltoe 1.0, we have offered two security providers for use in ASP.NET Core applications. With these two providers, you are able to log in to your apps using OAuth 2.0 flows with credentials provided from Cloud Foundry. You’re also able to secure microservice endpoints using JWT tokens also provided by Cloud Foundry.

With Steeltoe 2.1, we extended that same security functionality to 4.x applications. We support OWIN-based middleware for both MVC and WebAPI-based applications. We also added a Cloud Foundry `ServiceAuthorizationManager` which can be used in WCF-based applications for securing WCF endpoints.

### .NET Core 2.1

In addition to supporting .NET Core 2.0, ASP.NET Core 2.0, and .NET 4.6.1+, we are also adding support for .NET Core 2.1 and ASP.NET Core 2.1. Compatibility with .NET Core/ASP.NET core 2.0 in general has been preserved, though you will see a few  `Microsoft.Extensions` packages (for example: `Logging`, `Options`, `Configuration`) that will update to 2.1. Your ASP.NET Core dependencies should not be impacted.

One new feature added in Steeltoe 2.1 is dependent on Core 2.1: support for the new `HttpClientFactory`. We have added a new `DelegatingHandler` that will carry out service discovery lookups and random load balancing when used with an `HttpClient`. This functionality is similar to what we already offered in 2.0, but now provides a seamless experience when using the `HttpClientFactory`.

## 2.0.0

A large focus of Steeltoe version 2.0 is compatibility with .NET Standard 2.0. As part of this initiative, virtually all packages have been reorganized and renamed to minimize hard dependencies on other libraries and also help differentiate between packages with full-framework support and those for .NET Core. Most Steeltoe libraries now include a package ending with "Base" that provides the majority of the functionality. Packages ending with "Core" provide extra methods for working with Microsoft's Dependency Injection Framework, with the naming intended to coincide with .NET Core development. Full-framework support to date has been focused on Autofac. The relevant Steeltoe packages have names ending in "Autofac".

### CircuitBreaker

As described earlier in the general [release notes](#2-0-release-notes), Steeltoe Circuit breaker packages now have the following names: `Steeltoe.CircuitBreaker.HystrixBase`, `Steeltoe.CircuitBreaker.HystrixCore`, `Steeltoe.CircuitBreaker.HystrixAutofac`, `Steeltoe.CircuitBreaker.Hystrix.MetricsEventsCore`, and `Steeltoe.CircuitBreaker.Hystrix.MetricsStreamCore`.

### Common

New for Steeltoe 2.0 is a set of libraries with code shared between our libraries. You can use this code as well, but these libraries are not likely to receive much attention in this documentation.

### Configuration

In Steeltoe version 1.x, there are 3 packages for Configuration. As of 2.0.0, each of those packages now has a &ast;Base, a &ast;Core, and an &ast;Autofac (for example: `Steeltoe.Extensions.Configuration.ConfigServerBase`, `Steeltoe.Extensions.Configuration.ConfigServerCore`, and so on) for a total of 9 packages. If you deploy your application to Pivotal Cloud Foundry, be sure to use the `Pivotal.&ast;` packages.

#### Config Server Settings

Starting with version 1.1.0 of Steeltoe, you can now configure the timeout value the Steeltoe client uses when making Http requests to the Config Server.

#### Config Server Vault support

Starting with version 1.1.0 of Steeltoe, the Config Server client is compatible with Spring Cloud and Spring Cloud Services Config Server deployments that support using Hashicorp Vault as back-ends.

#### Known Issues

##### Unstructured data files

Unlike the Java version of the Config Server client, the Steeltoe client currently supports only property and yaml files, not plain text.

##### Client decryption option

Unless SSL/TLS is being used between the client and server, the Steeltoe client supports only clear text communication with the configuration server. Client decryption is not currently supported.

##### Server initiated reload

Currently, the client must initiate reloads. Steeltoe has not implemented handlers to listen for server change events.

### Connectors

As of version 2.0.0, all of the individual connectors have been rolled up into a single package: `Steeltoe.CloudFoundry.ConnectorBase`. Helper methods for ASP.NET Core/Microsoft DI have been moved to `Steeltoe.CloudFoundry.ConnectorCore`, `Steeltoe.CloudFoundry.Connector.EF6Core` (Entity Framework 6), and `Steeltoe.CloudFoundry.Connector.EFCore` (Entity Framework Core). Version 2.0.0 now includes a Microsoft SQL Server Connector. Classes and namespaces related to RabbitMQ have been renamed from `*Rabbit` to `*RabbitMQ`.

#### MySql Connector

Starting with version 1.0.1 of Steeltoe, the direct dependency on all of Oracle's MySql packages has been removed. This change lets the connector become more flexible in terms of which MySql ADO.NET providers and versions it supports. With this release, the connector is able to work with [Oracle's MySql Provider](https://dev.mysql.com/downloads/connector/net/) and the open source [MySqlConnector](https://mysql-net.github.io/MySqlConnector/) providers.

Additionally, as it relates to Entity Framework support, the connector has been updated to support [Oracle's Entity Framework Provider](https://dev.mysql.com/downloads/connector/net/) and the open source [Pomelo Entity Framework Provider](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql).

For more detail on how to use these providers, see the MySql connector documentation.

>CAUTION: This is a BREAKING change, as it now requires that you MUST explicitly include the packages and versions of the MySql/Entity framework code you wish to use in your application.

#### Postgres Connector

Starting with version 1.0.1 of Steeltoe, the direct dependency on the open source Npgsql package has been removed. This change lets the connector become more flexible in what Postgres ADO.NET providers and versions it supports.

For more detail on how to use the connector, see the Postgres connectors documentation.

>CAUTION: This is a BREAKING change, as it now requires that you MUST explicitly include the packages and versions of the Postgres/Entity framework code wish to use in your application.

#### RabbitMQ Connector

In version 2.0.0, all namespaces, classes and methods with `Rabbit` in the name were changed to `RabbitMQ` (for example, `AddRabbitConnection()` is now `AddRabbitMQConnection()`)

Starting with version 1.0.1 of Steeltoe, the direct dependency on the open source RabbitMQ Client package has been removed. This change lets the connector become more flexible in what version of the client it supports.

For more detail on how to use the connector, see the RabbitMQ connectors documentation.

>CAUTION: This is a BREAKING change, as it now requires that you MUST explicitly include the packages and versions of the RabbitMQ code you wish to use in your application.

Also, with this release, the connector has been updated to properly work with SSL/TLS based connections. Prior to this release, the connector did not support using the 'amqps' URL scheme.

#### Redis Connector

Starting with version 2.0.0 of Steeltoe, the direct dependencies on Redis packages have been removed. The Steeltoe connector works with the StackExchange libraries or `Microsoft.Extensions.Caching.Redis`. You include the package and version you prefer and use the appropriate methods to connect it. See the Redis Connector documentation for more information.

### Discovery

In version 1.x of Steeltoe, there were three packages. In version 2.0.0 there are six packages:

* `Steeltoe.Discovery.ClientAutofac`
* `Steeltoe.Discovery.ClientCore`
* `Steeltoe.Discovery.Eureka.ClientBase`
* `Pivotal.Discovery.ClientCore`
* `Pivotal.Discovery.ClientAutofac`
* `Pivotal.Discovery.Eureka.ClientBase`.

Be sure to use the `Pivotal.*.*` packages if you deploy your application to Pivotal Cloud Foundry. Version 2.0.0 also includes support for dynamic update of configuration options.

#### Eureka Version

Steeltoe has implemented a [Eureka 1.0 client](https://github.com/Netflix/eureka/wiki), not a 2.0 client. Eureka 2.0 is still a work in progress and is expected to have significant updates to its architecture and public API. At some point in time, we may examine a 2.0 implementation.

#### Eureka AWS Support

The Eureka client for Java contains features that enable operation on AWS. The Steeltoe version does not currently implement those features. Instead, this version has been optimized for Cloud Foundry environments. We may look at adding AWS cloud features at a future point in time.

#### Eureka Client Configuration

Not all configuration properties found in the Java client are available for configuration. Those that are supported and provided by the Steeltoe implementation have been documented in this guide.

#### Cloud Foundry C2C Support

Starting with version 1.1.0 of Steeltoe, the Steeltoe Eureka client lets you configure what hostname/address gets registered with the Eureka server for your service registrations. This feature is provided by using a new setting: `spring:cloud:discovery:registrationMethod`.  By using this setting, you can now make use of Cloud Foundry Container to Container (C2C) networking support.

### Logging

As of version 2.0.0, `Steeltoe.Extensions.Logging.CloudFoundry` is renamed to `Steeltoe.Extensions.Logging.DynamicLogger`

### Management

As of version 2.0.0, all of the individual management endpoints have been rolled up into a single package: `Steeltoe.Management.EndpointBase`. Helper methods for ASP.NET Core/Microsoft DI have been moved to `Steeltoe.Management.EndpointCore`. Convenience helpers to set up all endpoints at once are available in `Steeltoe.Management.CloudFoundryCore`. Additionally in 2.0.0, actuators identify themselves to PCF as Steeltoe, resulting in a Steeltoe icon in Pivotal Apps Manager. Also, certificate validation can be disabled on management endpoints.

### Security

New features for Steeltoe Security 2.0.0 include a client for [CredHub](https://github.com/cloudfoundry-incubator/credhub), support for using Cloud Foundry as an authentication provider in .NET Framework 4.x applications, and a JWT Provider for WCF applications.
