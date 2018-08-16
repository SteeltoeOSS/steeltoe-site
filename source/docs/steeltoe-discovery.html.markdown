---
title: Service Discovery
order: 30
date: 2018/2/8
tags:
---

A service registry provides a database that applications can use to implement the Service Discovery pattern, one of the key tenets of a microservices-based architecture. Trying to hand-configure each client of a service or adopt some form of access convention can be difficult and prove to be brittle in production. Instead, applications can use a service registry to dynamically discover and call registered services.

There are several options to choose from when implementing the Service Discovery pattern. Steeltoe has initially chosen to support one based on Eureka and using Netflix's Service Discovery server and client. For more information about Eureka, see the [Netflix/Eureka Wiki](https://github.com/Netflix/eureka/wiki) and the [Spring Cloud Netflix](http://projects.spring.io/spring-cloud/) documentation.

# 0.0 Initialize Dev Environment

All of the Steeltoe sample applications are in the same repository. If you have not already done so, use git to clone the [Steeltoe Samples](https://github.com/SteeltoeOSS/Samples) repository or download it with your browser from GitHub. The following example shows how to clone it with git:

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
```

>Note: All Service Discovery samples in the Samples repository have a base path of `Samples/Discovery/src/`.

Make sure your Cloud Foundry CLI tools are logged in and targeting the correct org and space, as follows:

```bash
> cf login [-a API_URL] [-u USERNAME] [-p PASSWORD] [-o ORG] [-s SPACE] [--skip-ssl-validation]
```

Alternatively, you can use the following command:

```bash
> cf target -o <YourOrg> -s <YourSpace>
```

The Service Discovery sample requires a Eureka server. If you intend to run the samples locally, install the Java 8 JDK and Maven 3.x now.

# 1.0 Netflix Eureka

Steeltoe's Eureka client implementation lets applications register services with a Eureka server and discover services registered by other applications. This Steeltoe client is an implementation of the 1.0 version of the Netflix Eureka client.

Steeltoe's Eureka client implementation supports the following .NET application types:

* ASP.NET (MVC, WebForm, WebAPI, WCF)
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

 In addition to the [quick start](#1-1-quick-start), you can choose from several other Steeltoe sample applications when looking for help in understanding how to use this client:

* [AspDotNet4/Fortune-Teller-Service4](https://github.com/SteeltoeOSS/Samples/tree/master/Discovery/src/AspDotNet4/Fortune-Teller-Service4): Same as the Quick Start next but built for ASP.NET 4.x and using the Autofac IOC container.
* [AspDotNet4/Fortune-Teller-UI4](https://github.com/SteeltoeOSS/Samples/tree/master/Discovery/src/AspDotNet4/Fortune-Teller-UI4): Same as the Quick Start next but built for ASP.NET 4.x and using the Autofac IOC container
* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore): A sample application showing how to use all of the Steeltoe components together in a ASP.NET Core application. This is a microservices-based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.
* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ): A polyglot microservices-based sample application showing interoperability between Java and .NET on Cloud Foundry. It is secured with OAuth2 Security Services and using Spring Cloud Services.

The source code for discovery can be found [here](https://github.com/SteeltoeOSS/Discovery).

## 1.1 Quick Start

This quick start uses multiple ASP.NET Core applications to show how to use the Steeltoe Discovery client to register and fetch services from a Eureka Server running locally on your development machine. It also shows how to take that same set of applications and push them to Cloud Foundry and use a Eureka Server operating there.

The application consists of two components: a Fortune-Teller-Service that registers a FortuneService, and a Fortune-Teller-UI that discovers the service and fetches fortunes from it.

### 1.1.1 Running Locally

To run the fortune teller service and the fortune teller UI on your local machine and observe the results, work through the following sections:

* [Start Eureka Server](#1-1-1-1-start-eureka-server)
* [Locate Sample](#1-1-1-2-locate-sample)
* [Run Fortune Teller](#1-1-1-3-run-fortune-teller)
* [Observe Logs](#1-1-1-4-observe-logs)
* [View Fortunes](#1-1-1-5-view-fortunes)

#### 1.1.1.1 Start Eureka Server

In this step, we fetch a GitHub repository from which we can start up a Netflix Eureka Server locally on the desktop. This server has been pre-configured to listen for service registrations and discovery requests at <http://localhost:8761/eureka>. The following script shows how to get the sample from GitHub and start the service:

```bash
> git clone https://github.com/spring-cloud-samples/eureka.git
> cd eureka
> mvnw spring-boot:run
```

#### 1.1.1.2 Locate Sample

Now that you have the service running, you need to change directory to where the sample is:

```bash
> cd Samples/Discovery/src/AspDotNetCore
```

#### 1.1.1.3 Run Fortune Teller

We recommend running this application with the dotnet CLI. Scripts are provided to start both the service and the UI with a single command, as follows:

```bash
# Use the helper scripts, passing in net461, netcoreapp2.0 or netcoreapp2.1
> .\RunFortuneTeller net461
```

You can also run the commands directly yourself, as follows:

```bash
# Run the service in one window:
> cd Samples/Discovery/src/AspDotNetCore/Fortune-Teller-Service
> dotnet run -f netcoreapp2.1 --force

# And the UI in another:
> cd Samples/Discovery/src/AspDotNetCore/Fortune-Teller-UI
> dotnet run -f netcoreapp2.1 --force
```

#### 1.1.1.4 Observe Logs

Each of the samples should produce logs resembling the following:

```bash
> dotnet run -f netcoreapp2.1
info: Microsoft.Data.Entity.Storage.Internal.InMemoryStore[1]
      Saved 50 entities to in-memory store.
Hosting environment: Production
Now listening on: http://*:5000
Application started. Press Ctrl+C to shut down.
```

Once you see `Application started...` for both applications, the Fortune Teller sample is ready for use.

#### 1.1.1.5 View Fortunes

Start a browser and visit <http://localhost:5555>. You should see your fortune displayed. Refresh the browser to see a new fortune.

### 1.1.2 Running on Cloud Foundry

To run the fortune teller service and the fortune teller UI on Cloud Foundry and observe the results, work through the following sections:

* [Start Eureka Server](#1-1-2-1-start-eureka-server)
* [Publish Both Applications](#1-1-2-2-publish-both-applications)
* [Push Both Applications](#1-1-2-3-push-both-applications)
* [Observe Logs](#1-1-2-4-observe-logs)
* [View Fortunes](#1-1-2-5-view-fortunes)

#### 1.1.2.1 Start Eureka Server

Use the Cloud Foundry CLI to create a service instance of the Spring Cloud Eureka Server on Cloud Foundry, as follows:

```bash
# Create a Eureka Server instance on Cloud Foundry
> cf create-service p-service-registry standard myDiscoveryService
>
# Wait for the service to be ready
> cf services
```

#### 1.1.2.2 Publish Both Applications

.NET Applications should be published before pushing to Cloud Foundry. You need to publish both Fortune-Teller-Service and Fortune-Teller-UI.

See [Publish Sample](#publish-sample) for instructions on how to publish this sample for either Linux or Windows.

#### 1.1.2.3 Push Both Applications

For the Fortune Teller to work on Cloud Foundry, you need to push both Fortune-Teller-Service and Fortune-Teller-UI.

See [Push Sample](#push-sample) for instructions on how to push this sample to either Linux or Windows on Cloud Foundry.

#### 1.1.2.4 Observe Logs

To see the logs as you startup the application, use `cf logs fortuneService` or `cf logs fortuneui`.

On a Linux cell, you should see output resembling the following during startup.

```bash
2016-06-01T09:14:14.38-0600 [CELL/0]     OUT Creating container
2016-06-01T09:14:15.93-0600 [CELL/0]     OUT Successfully created container
2016-06-01T09:14:17.14-0600 [CELL/0]     OUT Starting health monitoring of container
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Hosting environment: Development
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Content root path: /home/vcap/app
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Now listening on: http://*:8080
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Application started. Press Ctrl+C to shut down.
2016-06-01T09:14:21.41-0600 [CELL/0]     OUT Container became healthy
```

On Windows cells, you should see something slightly different but with the same information.

#### 1.1.2.5 View Fortunes

Start a browser and visit <http://fortuneui.x.y.z/> where `x.y.z` corresponds to the Cloud Foundry application domain that you are operating under.

You should see your fortune. Refresh the browser to see a new fortune.

### 1.1.3 Understanding the Sample

Fortune-Teller-Service was created with the .NET Core tooling `webapi` template (`dotnet new webapi`), and then modifications were made to add the Steeltoe frameworks.

To understand the Steeltoe related changes to the generated template code, examine the following files.

* `Fortune-Teller-Service.csproj`: Contains the `PackageReference` for the Steeltoe NuGet `Pivotal.Discovery.Client`.
* `Program.cs`: Code was added to the `ConfigurationBuilder` to pick up Cloud Foundry configuration values when pushed to Cloud Foundry and to use Cloud Foundry hosting.
* `appsettings.json`: Contains the configuration data needed to cause the Steeltoe Discovery client to register the FortuneService with the Eureka server and to NOT fetch service information from the Eureka server.
* `Startup.cs`: Code was added to the `ConfigureServices()` method to add the Discovery Client as a singleton to the service container. Additionally, code was added to the `Configure()` method to cause the Discovery Client to start communicating with the Eureka Server.

Various other files that pertain to the application were added to the project, but they do not directly interact with the Steeltoe Discovery client.

Fortune-Teller-UI was created with the .NET Core tooling `mvc` template (`dotnet new mvc`), and then modifications were made to add the Steeltoe frameworks.

To understand the Steeltoe related changes to the generated template code, examine the following files:

* `Fortune-Teller-UI.csproj`: Contains the `PackageReference` for the Steeltoe NuGet `Pivotal.Discovery.Client`.
* `Program.cs`: Code was added to the `ConfigurationBuilder` in order to pick up the Cloud Foundry configuration values when pushed to Cloud Foundry and to use Cloud Foundry hosting.
* `appsettings.json`: Contains the configuration data needed to cause the Steeltoe Discovery client to NOT register as a service, yet it still fetches service information from the Eureka server.
* `Startup.cs`: Code was added to the `ConfigureServices()` method to add the discovery client as a singleton to the service container. Additionally, code was added to the `Configure()` method to cause the discovery client to start communicating with the Eureka Server.
* `FortuneService.cs`: Contains code used to fetch the fortune from the FortuneService. Uses an injected `IDiscoveryClient`, together with the `DiscoveryHttpClientHandler`, to do the service lookup and to issue the HTTP GET request to the Fortune-Teller-Service.

## 1.2 Usage

You should know how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the client. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the client.

You should also know how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services and the middleware used in the app. Pay particular attention to the usage of the `Configure()` and `ConfigureServices()` methods.

You should also have a good understanding of the [Spring Cloud Eureka Server](http://projects.spring.io/spring-cloud/).

In order to use the Steeltoe Discovery client, you need to do the following:

* Add appropriate NuGet package reference to your project.
* Configure the settings the Discovery client will use to register services in the service registry.
* Configure the settings the Discovery client will use to discover services in the service registry.
* Add and Use the Discovery client service in the application.
* Use an injected `IDiscoveryClient` to lookup services.

>NOTE: Most of the example code in the following sections is based on using Discovery in a ASP.NET Core application. If you are developing a ASP.NET 4.x application or a console-based app, see the [other samples](https://github.com/SteeltoeOSS/Samples/tree/master/Discovery) for example code you can use.

### 1.2.1 Add NuGet References

You can choose from two Eureka Server client NuGets, depending on your needs.

If you plan on connecting only to the open source version of [Spring Cloud Eureka Server](http://projects.spring.io/spring-cloud/), you should use one of the packages described in the following table, depending on your application type and needs:

|App Type|Package|Description|
|---|---|---|
|Console/ASP.NET 4.x|`Steeltoe.Discovery.EurekaBase`|Base functionality. No dependency injection.|
|ASP.NET Core|`Steeltoe.Discovery.ClientCore`|Includes base. Adds ASP.NET Core dependency injection.|
|ASP.NET 4.x with Autofac|`Steeltoe.Discovery.ClientAutofac`|Includes base. Adds Autofac dependency injection.|

To add this type of NuGet to your project, add an element resembling the following `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.Discovery.ClientCore" Version= "2.1.0"/>
...
</ItemGroup>
```

If you plan to connect to the open source version of [Spring Cloud Eureka Server](http://projects.spring.io/spring-cloud/) AND you plan to push your application to Cloud Foundry to use [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-5/common/index.html), you should use one of the packages described in the following table, depending on your application type and needs:

|App Type|Package|Description|
|---|---|---|
|Console/ASP.NET 4.x|`Pivotal.Discovery.EurekaBase`|Base functionality. No dependency injection.|
|ASP.NET Core|`Pivotal.Discovery.ClientCore`|Includes base. Adds ASP.NET Core dependency injection.|
|ASP.NET 4.x with Autofac|`Pivotal.Discovery.ClientAutofac`|Includes base. Adds Autofac dependency injection.|

To add this type of NuGet to your project add an element resembling the following `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Pivotal.Discovery.ClientCore" Version= "2.1.0"/>
...
</ItemGroup>
```

### 1.2.2 Eureka Client Settings

To get the Steeltoe Discovery client to properly communicate with the Eureka server, you need to provide a few configuration settings to the client.

What you provide depends on whether you want your application to register a service and whether it also needs to discover services with which to communicate.

General settings that control the behavior of the client are found under the prefix with a key of `eureka:client`. Settings that affect registering services are found under the `eureka:instance` prefix.

The following table describes the settings that control the overall behavior of the client:

All of these settings should start with `eureka:client:`

|Key|Description|Default|
|---|---|---|
|shouldRegisterWithEureka|Enable or disable registering as a service|true|
|shouldFetchRegistry|Enable or disable discovering services|true|
|serviceUrl|Endpoint of the Eureka Server|`http://localhost:8761/eureka`|
|validateCertificates|Enable or disable certificate validation|true|
|registryFetchIntervalSeconds|Service fetch interval|30s|
|shouldFilterOnlyUpInstances|Whether to fetch only UP instances|true|
|instanceInfoReplicationIntervalSeconds|How often to replicate instance changes|40s |
|allowRedirects|Can redirect a client request to a backup|false|
|shouldDisableDelta|Whether to disable fetching of delta and, instead, get the full registry|false |
|registryRefreshSingleVipAddress|Whether to be interested in only the registry information for a single VIP|none |
|shouldOnDemandUpdateStatusChange|Whether status updates are trigger on-demand register/update|true|
|accessTokenUri|URI to use to obtain OAUTH access token|none|
|clientSecret|Secret to use to obtain OAUTH access token|none|
|clientId|Client ID to use to obtain OAUTH access token|none|
|eurekaServer:proxyHost|Proxy host to Eureka Server|none|
|eurekaServer:proxyPort|Proxy port to Eureka Server|none|
|eurekaServer:proxyUserName|Proxy user name to Eureka Server|none|
|eurekaServer:proxyPassword| Proxy password to Eureka Server|none
|eurekaServer:shouldGZipContent|Whether to compress content|true|
|eurekaServer:connectTimeoutSeconds|Connection timeout|5s|

**NOTE**: **Some settings above affect registering as a service as well.**

The following table describes the settings you can use to configure the behavior of the client as it relates to registering services:

|Key|Description|Default|
|---|---|---|
|appName|Name of the application to be registered with Eureka|'spring:application:name' or 'unknown'|
|port|Port on which the instance is registered|80|
|hostName|Address on which the instance is registered|computed|
|instanceId|Unique ID (within the scope of the `appName`) of the instance registered with Eureka|`computed`|
|appGroupName|Name of the application group to be registered with Eureka|none|
|instanceEnabledOnInit|Whether the instance should take traffic as soon as it is registered|false|
|securePort|Secure port on which the instance should receive traffic|443|
|nonSecurePortEnabled|Non-secure port enabled for traffic|true|
|securePortEnabled|Secure port enabled for traffic|false|
|leaseRenewalIntervalInSeconds|How often client needs to send heartbeats|30s|
|leaseExpirationDurationInSeconds|Time the Eureka server waits before removing instance|90s|
|vipAddress|Virtual host name|hostName + port|
|secureVipAddress|Secure virtual host name|hostName + securePort||
|metadataMap|Name/value pairs associated with the instance|none|
|statusPageUrlPath|Relative status page path for this instance|`/Status`|
|statusPageUrl|Absolute status page for this instance|computed|
|homePageUrlPath||`/`|
|homePageUrl|Absolute home page for this instance|computed|
|healthCheckUrlPath||`/healthcheck`|
|healthCheckUrl|Absolute health check page for this instance|computed|
|secureHealthCheckUrl|Secured absolute health check page for this instance|computed|
|ipAddress|IP address to register|computed|
|preferIpAddress|Whether to register by using IpAddress instead of hostname|false|
|registrationMethod|How to register service on Cloud Foundry. Can be `route`, `direct`, or `hostname`|`route`|

All of the settings in the preceding table should start with `eureka:instance:`.

You should register by using the `direct` setting mentioned earlier when you want to use container-to-container networking on Cloud Foundry. You should use the `hostname` setting on Cloud Foundry when you want the registration to use whatever value is configured or computed as `eureka:instance:hostName`.

For a complete understanding of the effects of many of these settings, we recommend that you review the documentation on the [Netflix Eureka Wiki](https://github.com/Netflix/eureka/wiki). In most cases, unless you are confident you understand the effects of changing the values from their defaults, we recommend that you use the defaults.

#### 1.2.2.1 Settings to Discover

The following example shows the clients settings in JSON that are necessary to cause the client to fetch the service registry from the server at an address of `http://localhost:8761/eureka/`:

```json
{
"spring": {
    "application": {
      "name": "fortuneUI"
    }
  },
  "eureka": {
    "client": {
      "serviceUrl": "http://localhost:8761/eureka/",
      "shouldRegisterWithEureka": false
    }
  }
  ...
}
```

The `eureka:client:shouldRegisterWithEureka` instructs the client to NOT register any services in the registry, as the application does not offer any services (that is, it only wants to discover).

>NOTE: If you use self-signed certificates on Cloud Foundry, you might run into SSL certificate validation issues when pushing apps. A quick way to work around this is to disable certificate validation until a proper solution can be put in place.

#### 1.2.2.2 Configure Settings

The following example shows the clients settings in JSON that are necessary to cause the client to register a service named `fortuneService` with a Eureka Server at an address of `http://localhost:8761/eureka/`:

```json
{
 "spring": {
    "application": {
      "name":  "fortuneService"
    }
  },
  "eureka": {
    "client": {
      "serviceUrl": "http://localhost:8761/eureka/",
      "shouldFetchRegistry": false
    },
    "instance": {
      "port": 5000
    }
  }
  ...
}
```

The `eureka:instance:port` setting is the port on which the service is registered. The hostName portion is determined automatically at runtime. The `eureka:client:shouldFetchRegistry` setting instructs the client NOT to fetch the registry as the app does not need to discover services. It only wants to register a service. The default for the `shouldFetchRegistry` setting is true.

The samples and most templates are already set up to read from `appsettings.json`. See [Reading Configuration Values](#reading-configuration-values) for more information about reading configuration values.

### 1.2.3 Cloud Foundry

When you want to use a Eureka Server on Cloud Foundry and you have installed [Spring Cloud Services](https://docs.pivotal.io/spring-cloud-services/1-5/common/index.html), you can create and bind a instance of the server to the application by using the Cloud Foundry CLI, as follows:

```bash
> # Create eureka server instance named `myDiscoveryService`
> cf create-service p-service-registry standard myDiscoveryService
>
> # Wait for service to become ready
> cf services
>
> # Bind the service to `myApp`
> cf bind-service myApp myDiscoveryService
>
> # Restage the app to pick up change
> cf restage myApp
```

For more information on using the Eureka Server on Cloud Foundry, see the [Spring Cloud Services](https://docs.pivotal.io/spring-cloud-services/1-5/common/index.html) documentation.

Once the service is bound to your application, the connection properties are available in `VCAP_SERVICES`. See [Reading Configuration Values](#reading-configuration-values) for more information on reading `VCAP_SERVICES`.

### 1.2.4 Add and Use Discovery Client

The next step is to add the Steeltoe Eureka client to the service container and use it to cause the client to start communicating with the server.

You do these two things in the `ConfigureServices()` and `Configure()` methods of the `Startup` class, as shown in the following example:

```csharp
using Pivotal.Discovery.Client;
// or
using Steeltoe.Discovery.Client;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Steeltoe Discovery Client service
        services.AddDiscoveryClient(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    public void Configure(IApplicationBuilder app, ...)
    {
        ...
        app.UseStaticFiles();
        app.UseMvc();

        // Use the Steeltoe Discovery Client service
        app.UseDiscoveryClient();
    }
    ...
```

>NOTE: If you use the `Pivotal.Discovery.ClientCore` package, you need to add a `using Pivotal.Discovery.Client;`.  If you use the `Steeltoe.Discovery.ClientCore`, you need to add a `Steeltoe.Discovery.Client;`. Doing so is required to gain access to the extension methods described later.

### 1.2.5 Registering Services

If you configured the clients settings to register services, the service is automatically registered when the `UseDiscoveryClient()` method is called in the `Configure()` method. You do not need to do anything else to cause service registration.

### 1.2.6 Discovering Services

Once the app has started, the Discovery client begins to operate in the background, both registering services and periodically fetching the service registry from the server.

The simplest way to use the registry to lookup services is to use the Steeltoe `DiscoveryHttpClientHandler` together with a `HttpClient`. See the sample code later in this section. The `FortuneService` class retrieves Fortunes from the Fortune micro-service. The micro-service is registered under a name of `fortuneService`.

First, notice that the `FortuneService` constructor takes an `IDiscoveryClient` as a parameter. This is the Steeltoe Discovery Client interface that you can use to lookup services in the service registry.

Upon application startup, the Discovery client interface is registered with the service container by using the `AddDiscoveryClient()` method call so that it can be easily used in any controller, view, or service. Notice that the constructor code for the controller uses the client by creating an instance of the Steeltoe provided `DiscoveryHttpClientHandler`, giving it a reference to the injected `IDiscoveryClient`.

Next, notice that when the `RandomFortuneAsync()` method is called, you see that the `HttpClient` is created with the Steeltoe handler. The handler's role is to intercept any requests made by using the `HttpClient` and to evaluate the URL to see if the host portion of the URL can be resolved from the current service registry. In the upcoming example, it attempts to resolve the `fortuneService` name into an actual `host:port` before letting the request continue.

If the name cannot be resolved, the handler ignores the request URL and lets the request continue unchanged. However, in the case where the lookup succeeds, the handler replaces the service name with the resolved host and port and then lets the request continue processing.

Of course,  you need not use the handler. Instead, if you need to, you can make lookup requests directly on the `IDiscoveryClient` interface.

>NOTE: When you use the Steeltoe handler for discovering services, you automatically get random load balancer client functionality. That is, if there are multiple instances registered under a particular service name, the handler randomly selects one of those instances each time the handler is invoked.

The following example shows a discovery client that use the Pivotal discovery client library:

```csharp
using Pivotal.Discovery.Client;
// or
// using Steeltoe.Discovery.Client;

...
public class FortuneService : IFortuneService
{
    DiscoveryHttpClientHandler _handler;
    private const string RANDOM_FORTUNE_URL = "http://fortuneService/api/fortunes/random";
    public FortuneService(IDiscoveryClient client)
    {
        _handler = new DiscoveryHttpClientHandler(client);
    }
    public async Task<string> RandomFortuneAsync()
    {
        var client = GetClient();
        return await client.GetStringAsync(RANDOM_FORTUNE_URL);
    }
    private HttpClient GetClient()
    {
        var client = new HttpClient(_handler, false);
        return client;
    }
}
```

#### 1.2.6.1 Using HttpClientFactory

In addition to the `DiscoveryHttpClientHandler` mentioned above, you also have the option to use the .NET provided `HttpClientFactory` together with the Steeltoe provided `DiscoveryHttpMessageHandler` to do service lookup.

`DiscoveryHttpMessageHandler` is a `DelegatingHandler` that be used, much like the `DiscoveryHttpClientHandler`, to intercept requests and to evaluate the URL to see if the host portion of the URL can be resolved from the current service registry.  The handler will do this for any `HttpClient`s created by the factory.

Here is just one example of how you can make use of it in your application:

```csharp
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; set; }

    public void ConfigureServices(IServiceCollection services)
    {
      services.AddDiscoveryClient(Configuration);

      // Add Steeltoe handler to container
      services.AddTransient<DiscoveryHttpMessageHandler>();

      // Configure a HttpClient
      services.AddHttpClient("fortunes", c =>
      {
              c.BaseAddress = new Uri("http://fortuneService/api/fortunes/");
      })
      .AddHttpMessageHandler<DiscoveryHttpMessageHandler>()
      .AddTypedClient<IFortuneService, FortuneService>();

      // Add framework services.
      services.AddMvc();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
    {
      ....

      // Start discovery background thread
      app.UseDiscoveryClient();
    }
}
```

Check out the Microsoft documentation on [HttpClientFactory](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/http-requests?view=aspnetcore-2.1) to see all the various ways you can make use of the Steeltoe message handler.

### 1.2.7 Enable Logging

Sometimes, it is desirable to turn on debug logging in the Discovery client. To do so, you can modify the `appsettings.json` file and turn on Debug level logging for the Steeltoe/Pivotal components, as shown in the following example:

Here is an example `appsettings.json` file:

```json
{
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Warning",
      "Pivotal": "Debug",
      "Steeltoe": "Debug"
    }
  },
  ...
}
```

# Common Steps

This section describes tasks that are common to many of the processes described in this guide.

## Publish Sample

### ASP.NET Core

You can use the `dotnet` CLI to build and locally publish the application with your preferred framework and runtime. To get started, run the following command:

```bash
dotnet restore --configfile nuget.config
```

Then you can use one of the following commands to publish:

* Linux with .NET Core: `dotnet publish -f netcoreapp2.1 -r ubuntu.14.04-x64`
* Windows with .NET Core: `dotnet publish -f netcoreapp2.1 -r win10-x64`
* Windows with .NET Platform: `dotnet publish -f net461 -r win10-x64`

### ASP.NET 4.x

1. Open the solution for the sample in Visual Studio
1. Right click on the project, select "Publish"
1. Use the included `FolderProfile` to publish to `bin/Debug/net461/win10-x64/publish`

## Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry using the parameters that match what you selected for framework and runtime:

```bash
# Push to Linux cell
cf push -f manifest.yml -p bin/Debug/netcoreapp2.1/ubuntu.14.04-x64/publish

# Push to Windows cell, .NET Core
cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.1/win10-x64/publish

# Push to Windows cell, .NET Framework
cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

>NOTE: Manifest file names may vary. Some samples use a different manifest for .NET 4 vs .NET Core.

>NOTE: All sample manifests have been defined to bind their application to their service(s).

## Reading Configuration Values

Once the settings have been defined, the next step is to read them so that they can be made available to the connector.

The next example reads settings from the `appsettings.json` file with the .NET JSON configuration provider (`AddJsonFile("appsettings.json")`) and from `VCAP_SERVICES` with `AddCloudFoundry()`. Both sources are then added to the configuration builder, as follows:

```csharp
public class Program {
    ...
    public static IWebHost BuildWebHost(string[] args)
    {
        return new WebHostBuilder()
            ...
            .UseCloudFoundryHosting()
            ...
            .ConfigureAppConfiguration((builderContext, configBuilder) =>
            {
                var env = builderContext.HostingEnvironment;
                configBuilder.SetBasePath(env.ContentRootPath)
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                    .AddEnvironmentVariables()
                    // Add to configuration the Cloudfoundry VCAP settings
                    .AddCloudFoundry();
            })
            .Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings from service bindings merge with the settings from other configuration mechanisms (such as `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration take precedences and overrides all others.

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool such as [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config)

>NOTE: If you use the Spring Cloud Config Server, `AddConfigServer()` automatically calls `AddCloudFoundry()` for you
