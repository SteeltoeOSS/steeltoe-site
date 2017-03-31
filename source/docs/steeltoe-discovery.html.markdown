---
title: Service Discovery
date: 2016/4/1
tags:
---

A service registry provides a database that applications can use in implementing the Service Discovery pattern; one of the key tenets of a micro-services based architecture. Trying to hand-configure each client of a service or adopt some form of access convention can be difficult and prove to be brittle in production. Instead, applications can use a service registry to dynamically discover and call registered services.

There are several options to choose from when implementing the Service Discovery pattern. Steeltoe has initially chosen to support one based on Eureka; using Netflix's Service Discovery server and client. For more information about Eureka see the [Netflix/Eureka Wiki](https://github.com/Netflix/eureka/wiki) and the [Spring Cloud Netflix](http://cloud.spring.io/spring-cloud-netflix/spring-cloud-netflix.html) documentation.

In the future you can expect to see more Service Discovery options as part of the Steeltoe framework.

### 1.0 Netflix Eureka
The Steeltoe Eureka client enables applications to register services with a Eureka server and to discover services registered by other applications. This Steeltoe client is an implementation of the 1.0 version of the Netflix Eureka client.

The Steeltoe Eureka client supports the following .NET application types:

 * ASP.NET - MVC, WebForm, WebAPI, WCF
 * ASP.NET Core
 * Console apps (.NET Framework and .NET Core)
 
 In addition to the quick start below, there are several other Steeltoe sample applications that you can choose from when looking for help in understanding how to make use of this client:
 
 * [AspDotNet4/Fortune-Teller-Service4](https://github.com/SteeltoeOSS/Samples/tree/master/Discovery/src/AspDotNet4/Fortune-Teller-Service4) - same as the Quick Start below, but built for ASP.NET 4.x and using the Autofac IOC container 
 * [AspDotNet4/Fortune-Teller-UI4](https://github.com/SteeltoeOSS/Samples/tree/master/Discovery/src/AspDotNet4/Fortune-Teller-UI4) - same as the Quick Start below, but built for ASP.NET 4.x and using the Autofac IOC container 
 * [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) -  a sample app illustrating how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.
 * [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ) - a polyglot (i.e. Java and .NET) micro-services based sample app illustrating inter-operability between Java and .NET based micro-services running on Cloud Foundry, and secured with OAuth2 Security Services and using Spring Cloud Services.
 
 The source code for this client can be found [here](https://github.com/SteeltoeOSS/Discovery).

#### 1.1 Quick Start

This quick start makes use of multiple ASP.NET Core applications to illustrate how to use the Steeltoe Discovery client to register and fetch services from an Eureka Server running locally on your development machine and also how to take that same set of applications and push them to Cloud Foundry and make use of an Eureka Server operating there. 

The application consists of two components; a Fortune-Teller-Service which registers a FortuneService and a Fortune-Teller-UI which discovers the service and fetches fortunes from it. 

##### 1.1.1  Start Eureka Server Locally

In this step, we will fetch a repository from which we can start up a Netflix Eureka Server locally on our desktop. This server has been pre-configured to listen for service registrations and discovery requests at  http://localhost:8761/eureka .


```
> git clone https://github.com/spring-cloud-samples/eureka.git
> cd eureka
> mvnw spring-boot:run
```

##### 1.1.2 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
```

##### 1.1.3 Run Fortune-Teller-Service
Use the dotnet CLI to run the application. Note below we show how to run the app on both frameworks the sample supports. Just pick one in order to proceed.

```
> cd Samples/Discovery/src/AspDotNetCore/Fortune-Teller-Service
> dotnet restore --configfile nuget.config
>
> # Run on .NET Core 
> dotnet run -f netcoreapp1.1  --server.urls http://*:5000
>
> # Run on .NET Framework on Windows
> dotnet run -f net462  --server.urls http://*:5000
```

##### 1.1.4 Observe Logs
When you startup the Fortune-Teller-Service, you should see something like the following:

```
> dotnet run -f netcoreapp1.1 --server.urls http://*:5000
info: Microsoft.Data.Entity.Storage.Internal.InMemoryStore[1]
      Saved 50 entities to in-memory store.
Hosting environment: Production
Now listening on: http://*:5000
Application started. Press Ctrl+C to shut down.
```

At this point the Fortune-Teller-Service is up and running and ready for the Fortune-Teller-UI to ask for fortunes.

##### 1.1.5 Run Fortune-Teller-UI
Use the dotnet CLI to run the application. Note below we show how to run the app on both frameworks the sample supports. Just pick one in order to proceed.

```
> cd Samples/Discovery/src/AspDotNetCore/Fortune-Teller-UI
> dotnet restore --configfile nuget.config
>
>  # Run on .NET Core 
> dotnet run -f netcoreapp1.1  --server.urls http://*:5555
>
>  # Run on .NET Framework on Windows
> dotnet run -f net462  --server.urls http://*:5555
```

##### 1.1.6 Observe Logs
When you startup the Fortune-Teller-UI, you should see something like the following:

```
> dotnet run -f netcoreapp1.1 --server.urls http://*:5555
Hosting environment: Production
Now listening on: http://*:5555
Application started. Press Ctrl+C to shut down.
```

##### 1.1.7 What to expect

Fire up a browser and hit http://localhost:5555.  You should see your fortune displayed. Refresh the browser to see a new fortune.

##### 1.1.8 Start Eureka Server Cloud Foundry

In this step, we use the Cloud Foundry CLI to create a service instance of the Spring Cloud Eureka Server on Cloud Foundry.

```
# Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
# Create a Eureka Server instance on Cloud Foundry
> cf create-service p-service-registry standard myDiscoveryService
>
# Wait for the service to become ready
> cf services 
```

##### 1.1.9 Publish Fortune-Teller-Service 
Use the `dotnet` CLI to build and publish the Fortune-Teller-Service to the folder `publish`. 

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```
> cd Samples/Discovery/src/AspDotNetCore/Fortune-Teller-Service
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
>
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64 
>
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net462 -r win10-x64  
```

##### 1.1.10 Push Fortune-Teller-Service 

Use the Cloud Foundry CLI to push the published Fortune-Teller-Service to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the Fortune-Teller-Service to `myDiscoveryService` created above.

##### 1.1.11 Publish Fortune-Teller-UI

Use the `dotnet` CLI to build and publish the Fortune-Teller-UI to the folder `publish`. 

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```
> cd Samples/Discovery/src/AspDotNetCore/Fortune-Teller-UI
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
>
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64
>  
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net462 -r win10-x64  
```

##### 1.1.12 Push Fortune-Teller-UI 

Use the Cloud Foundry CLI to push the published Fortune-Teller-UI to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish  
>  
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the Fortune-Teller-UI to `myDiscoveryService` created above.

##### 1.1.13 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs fortuneService` or `cf logs fortuneui`)

On a Linux cell, you should see something like this during startup. On Windows cells you will see something slightly different.

```
2016-06-01T09:14:14.38-0600 [CELL/0]     OUT Creating container
2016-06-01T09:14:15.93-0600 [CELL/0]     OUT Successfully created container
2016-06-01T09:14:17.14-0600 [CELL/0]     OUT Starting health monitoring of container
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Hosting environment: Development
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Content root path: /home/vcap/app
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Now listening on: http://*:8080
2016-06-01T09:14:21.04-0600 [APP/0]      OUT Application started. Press Ctrl+C to shut down.
2016-06-01T09:14:21.41-0600 [CELL/0]     OUT Container became healthy

```

##### 1.1.14 What to expect

Fire up a browser and hit http://fortuneui.x.y.z/ where `x.y.z` corresponds to the Cloud Foundry application domain that you are operating under.  

You should see your fortune displayed. Refresh the browser to see a new fortune.

##### 1.1.15 Understand Sample

Fortune-Teller-Service was created using the .NET Core tooling `webapi` template ( i.e. `dotnet new webapi` ).  

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files. Note that there are various other files added to the project that pertain the the application, but do not directly interact with the Steeltoe Discovery client.

 * `Fortune-Teller-Service.csproj` - Contains `PackageReference` for Steeltoe NuGet `Pivotal.Discovery.Client`
 * `Program.cs` - Code added to read the `--server.urls` command line.
 * `appsettings.json` - Contains configuration data needed to cause the Steeltoe Discovery client to register the FortuneService with the Eureka server and to NOT fetch service information from the Eureka server.
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add the Discovery Client as a singleton to the service container. Additionally, code was added to the `Configure()` method to cause the Discovery Client to start communicating with the Eureka Server. And finally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry configuration values when pushed to Cloud Foundry.
 
Fortune-Teller-UI was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ).  

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

 * `Fortune-Teller-UI.csproj`- Contains `PackageReference` for Steeltoe NuGet `Pivotal.Discovery.Client`
 * `Program.cs` - Code added to read the `--server.urls` command line.
 * `appsettings.json` - Contains configuration data needed to cause the Steeltoe Discovery client to NOT register as a service, but yet it will still fetch service information from the Eureka server.
 * `Startup.cs`- Code added to the `ConfigureServices()` method to add Discovery Client as a singleton to the service container. Additionally, code was added to the `Configure()` method to cause the Discovery Client to start communicating with the Eureka Server. And finally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry configuration values when pushed to Cloud Foundry.
 * `FortuneService.cs` - Contains code used to fetch the fortune from the FortuneService.  Uses injected `IDiscoveryClient` together with the `DiscoveryHttpClientHandler` to do the service lookup and to issue the HTTP GET request to the Fortune-Teller-Service.
 

#### 1.2 Usage
You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the client. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the client.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services and the middleware used in the app. Specifically pay particular attention to the usage of the `Configure()` and `ConfigureServices()` methods. 

You should also have a good understanding of the [Spring Cloud Eureka Server](https://cloud.spring.io/spring-cloud-netflix/).

In order to use the Steeltoe Discovery client you need to do the following:

 * Add appropriate NuGet package reference to your project.
 * Configure the settings the Discovery client will use to register services in the service registry.
 * Configure the settings the Discovery client will use to discover services in the service registry.  
 * Add and Use the Discovery client service in the application.
 * Use an injected `IDiscoveryClient` to lookup services.

##### 1.2.1 Add NuGet Reference
There are two Eureka Server client NuGets that you can choose from depending on your needs. 

If you plan on only connecting to the open source version of [Spring Cloud Eureka Server](https://cloud.spring.io/spring-cloud-netflix/), then you should use the `Steeltoe.Discovery.Client` package.

In this case add the client to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Discovery.Client" Version= "1.0.0"/>
...
</ItemGroup>
```

If you plan on connecting to the open source version of [Spring Cloud Eureka Server](http://cloud.spring.io/spring-cloud-static/spring-cloud-netflix/1.2.6.RELEASE/), AND you plan on pushing your application to Cloud Foundry to make use of [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-3/common/index.html), then you should use the `Pivotal.Discovery.Client` package.

In this case add the client to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Pivotal.Discovery.Client" Version= "1.0.0"/>
...
</ItemGroup>
```

##### 1.2.2 Eureka Client Settings
To get the Steeltoe Discovery client to properly communicate with the Eureka server you need to provide a few configuration settings to the client.  

What you provide depends on whether you want your application register a service and whether it will need to discover services to communicate with.

General settings that control the behavior of the client are found under the prefix with the key `eureka:client`. Settings that control registering services are found under the prefix `eureka:instance`. 

The first table below is a table of settings which control the overall behavior of the client.

All of these client settings should start with `eureka:client:`. 

|Key|Description|
|------|------|
|**shouldRegisterWithEureka**|Enable or disable registering as a service, defaults = true|
|**shouldFetchRegistry**|Enable or disable discovering services, defaults = true|
|**serviceUrl**|Endpoint of Eureka Server, defaults = `http://localhost:8761/eureka`|
|**validate_certificates**|Enable or disable certificate validation, default = true|
|**registryFetchIntervalSeconds**|Service fetch interval, default = 30s|
|**shouldFilterOnlyUpInstances**|Only fetch UP instances, default = true|
|**instanceInfoReplicationIntervalSeconds**|How often to replicate instance changes, default = 40s |
|**allowRedirects**|Can redirect a client request to a backup, default = false|
|**shouldDisableDelta**|Disable fetching of delta, instead get the full registry, default = false |
|**registryRefreshSingleVipAddress**|Only interested in the registry information for a single VIP, default = none |
|**shouldOnDemandUpdateStatusChange**|Status updates trigger on-demand register/update,  default = true|
|**eurekaServer:proxyHost**|Proxy host to Eureka Server, default = none|
|**eurekaServer:proxyPort**|Proxy port to Eureka Server, default = none|
|**eurekaServer:proxyUserName**|Proxy user name to Eureka Server, default = none|
|**eurekaServer:proxyPassword**| Proxy password to Eureka Server, default = none
|**eurekaServer:shouldGZipContent**|Content compressed, default = true|
|**eurekaServer:connectTimeoutSeconds**|Connection timeout, default = 5s|


The next table of settings describe those settings you can use to configure the behavior of the client as it relates to registering services.

All of these client settings should start with `eureka:instance:`. 

|Key|Description|
|------|------|
|**name**|Name of the application to be registered with eureka, default='spring:application:name' or 'unknown'|
|**shouldRegisterWithEureka**|Enable or disable registering as a service, defaults = true|
|**serviceUrl**|Endpoint of Eureka Server, defaults = `http://localhost:8761/eureka`|
|**validate_certificates**|Enable or disable certificate validation, default = true|
|**registryFetchIntervalSeconds**|Service fetch interval, default = 30s|
|**shouldFilterOnlyUpInstances**|Only fetch UP instances, default = true|
|**port**|Port on which the instance should receive traffic, default = 80|
|**hostName**|Address on which the instance should receive traffic, default = computed|
|**instanceId**|Unique Id (within the scope of the appName) of instance registered with eureka, default=`computed`|
|**appGroupName**|Name of the application group to be registered with eureka, default = none|
|**instanceEnabledOnInit**|Instance should take traffic as soon as it is registered, default=false|
|**securePort**|Secure port on which the instance should receive traffic, default = 443|
|**nonSecurePortEnabled**|Non-secure port enabled for traffic, default = true|
|**securePortEnabled**|Secure port enabled for traffic, default=false|
|**leaseRenewalIntervalInSeconds**|How often client needs to send heartbeats, default =30s|
|**leaseExpirationDurationInSeconds**|Time the eureka server waits before removing instance, default = 90s|
|**vipAddress**|Virtual host name, default = hostName + port|
|**secureVipAddress**|Secure virtual host name, default = hostName + securePort||
|**metadataMap**|Name/value pairs associated with instance, default=none|
|**statusPageUrlPath**|Relative status page path for this instance, default=`/Status`|
|**statusPageUrl**|Absolute status page for this instance, default=computed|
|**homePageUrlPath**|, default=`/`|
|**homePageUrl**|Absolute home page for this instance, default=computed|
|**healthCheckUrlPath**|, default=`/healthcheck`|
|**healthCheckUrl**|Absolute health check page for this instance, default=computed|
|**secureHealthCheckUrl**|Secured absolute health check page for this instance, default=computed|

For a complete understanding of the effects of these settings, we recommend that you review the documentation on the [Netflix Eureka Wiki](https://github.com/Netflix/eureka/wiki). In most cases, unless you are confident you understand the effects of changing the values from their defaults, we recommend you just use the defaults.

###### 1.2.2.1 Settings to Discover

Below is an example of the clients settings in JSON which are necessary to get cause the client to fetch the service registry from server at address `http://localhost:8761/eureka/` at startup.  

The `eureka:client:shouldRegisterWithEureka` instructs the client NOT to register any services in the registry; as the application will not be offering up any services (i.e. it only wants to discover).

```
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
  .....
}
```

>If you are using self-signed certificates on Cloud Foundry, it is possible that you might run into SSL certificate validation issues when pushing apps. A quick way to work around this is to disable certificate validation until a proper solution can be put in place.

###### 1.2.2.2 Settings to Register

Below is an example of the clients settings in JSON that are necessary to cause the client to register a service named `fortuneService` with a Eureka Server at address `http://localhost:8761/eureka/`.  

The `eureka:instance:port` setting is the port upon which the service will be registered upon; the hostName portion will be determined automatically at runtime. The `eureka:client:shouldFetchRegistry` setting instructs the client NOT to fetch the registry as the app will not be needing to discover services; it only wants to register a service. The default for the `shouldFetchRegistry` setting is true.

```
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
  .....
}
```

###### 1.2.2.2 Configure Settings

Once the client settings have been defined and put in a file, then the next step is to get them read in so they can be made available to the client. 

Using the code below, you can see that the clients configuration settings from above should be put in `appsettings.json` and included with the application.  Then, by using the .NET provided JSON configuration provider we are able to read in the settings simply by adding the provider to the configuration builder (e.g. `AddJsonFile("appsettings.json")`.  

```

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)
            
            // Read in Discovery clients configuration
            .AddJsonFile("appsettings.json")
            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ....
```

If you wanted to managed the settings centrally, you can use the Spring Cloud Config Server (i.e. `AddConfigServer()`), instead of a local JSON file (i.e. `AddJsonFile()`), simply by putting the settings in a github repository and configuring the Config server to serve its configuration data from that repository.

##### 1.2.3 Cloud Foundry

When you want to use a Eureka Server on Cloud Foundry and you have installed Spring Cloud Services, you can create and bind a instance of it to the application using the Cloud Foundry CLI as follows:

```
> cf target -o myorg -s myspace
> # Create eureka server instance named `myDiscoveryService`
> cf create-service p-service-registry standard myDiscoveryService
> # Wait for service to become ready
> cf services 
> # Bind the service to `myApp`
> cf bind-service myApp myDiscoveryService
> # Restage the app to pick up change
> cf restage myApp
```

For more information on using the Eureka Server on Cloud Foundry, see the [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-3/common/) documentation.

Once you have bound the service to the application, the Eureka Server settings will become available and be setup in `VCAP_SERVICES`.

In order for the binding settings to be picked up and put in the configuration, you have to make use of the Cloud Foundry configuration provider.  

To do that, simply add a `AddCloudFoundry()` method call to the `ConfigurationBuilder`.  Here is an example:

```

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)
            
            // Read in Discovery clients configuration
            .AddJsonFile("appsettings.json")
            
            // Add `VCAP_` configuration info
            .AddCloudFoundry()
            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ....
```

Then when you push the application to Cloud Foundry, the Eureka Server settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`). 

If there are any merge conflicts, then the service binding settings will take precedence and will override all others. 

>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 1.2.4 Add and Use Discovery Client

The next step is to add the Steeltoe client to the service container and use it to cause the client to start communicating with the server.  

You do these two things in the `ConfigureServices()` and `Configure()` methods of the `Startup` class.  

Note: You will need to add a `#using Pivotal.Discovery.Client;` if you are using the `Pivotal.Discovery.Client` package, or a  `#using Steeltoe.Discovery.Client;` if you are using the `Steeltoe.Discovery.Client`.  This is required in order to gain access to the extension methods shown below.

```
#using Pivotal.Discovery.Client;  
// or
#using Steeltoe.Discovery.Client;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Steeltoe Discovery Client service
        services.AddDiscoveryClient(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    public void Configure(IApplicationBuilder app, ....)
    {
        ....
        app.UseStaticFiles();
        app.UseMvc();
        
        // Use the Steeltoe Discovery Client service
        app.UseDiscoveryClient();
    }
    ....
```

##### 1.2.5 Registering Services

If you have configured the clients settings to register services, then once the `UseDiscoveryClient()` method is called in the `Configure()` method, then the service will be automatically registered.  You have to do nothing else to cause service registration.

##### 1.2.6 Discovering Services 
Once the app has started, the Discovery client will begin to operate in the background; both registering services and periodically fetching the service registry from the server.

The simplest way of using the registry to lookup services is to use the Steeltoe `DiscoveryHttpClientHandler` together with a `HttpClient`. For an example see the sample code below. The `FortuneService` class is intended to be used to retrieve Fortunes from a Fortune micro-service. The micro-service will be registered under the name `fortuneService`.  

First, notice that the `FortuneService` constructor takes a `IDiscoveryClient` as a parameter. This is the Steeltoe discovery client interface which you can use to lookup services in the service registry. 

Upon application startup, it is registered with the service container using the `AddDiscoveryClient()` method call so it can be easily used in any controller, view or service in the app.  Notice that the constructor code for the controller makes use of the client by creating an instance of the Steeltoe provided `DiscoveryHttpClientHandler`, giving it a reference to the injected `IDiscoveryClient`. 

Next, notice that when the `RandomFortuneAsync()` method is called, you see that the `HttpClient` is created with the handler. The handlers role is to intercept any requests made using the `HttpClient` and to evaluate the URL to see if the host portion of the URL can be resolved from the current service registry.  In this example, it will attempt to resolve the "fortuneService" name into an actual `host:port` before allowing the request to continue. 

If the name can't be resolved, the handler simply ignores the request, and allows the request to continue unchanged. But in the case where the the lookup has succeeded, the handler will replace service name with the resolved host and port and then let the request continue processing.

Of course you don't have to use the handler, instead you can make lookup requests directly on the `IDiscoveryClient` interface if you need to.

```
#using Pivotal.Discovery.Client;  
// or
#using Steeltoe.Discovery.Client;

....
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
 
##### 1.2.7 Enable Logging
Sometimes its desirable to turn on debug logging in the Discovery client.  To do this, you can modify the `appsettings.json` file and turn on Debug level logging for the Steeltoe/Pivotal components.

Here is an example `appsettings.json` file:

```
{
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Warning",
      "Pivotal": "Debug",
      "Steeltoe":  "Debug"
    }
  },
  .....
}
```


