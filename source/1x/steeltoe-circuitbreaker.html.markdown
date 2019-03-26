---
title: Circuit Breaker
order: 60
date: 2016/4/1
tags:
---

The Steeltoe Circuit Breaker framework provide applications with an implementation of the Circuit Breaker pattern. Cloud-native architectures are typically composed of multiple layers of distributed services. End-user requests may comprise multiple calls to these services, and if a lower-level service fails, the failure can cascade up to the end user and spread to other dependent services. Heavy traffic to a failing service can also make it difficult to repair. By using Circuit Breaker frameworks, you can prevent failures from cascading and provide fallback behavior until a failing service is restored to normal operation.

![cb](/images/circuit-breaker-overview.png)

When applied to a service, a circuit breaker watches for failing calls to the service.  If failures reach a certain threshold, it “opens” the circuit and automatically redirects calls to the specified fallback mechanism. This gives the failing service time to recover.

There are several options to choose from when implementing the Circuit Breaker pattern. Steeltoe has initially chosen to support one based on Hystrix; Netflix's Latency and Fault Tolerance library for distributed systems. For more information about Hystrix see the [Netflix/Hystrix Wiki](https://github.com/Netflix/Hystrix/wiki) and the [Spring Cloud Netflix](https://projects.spring.io/spring-cloud/) documentation.

In the future you can expect to see more Circuit Breaker options as part of Steeltoe.

# 1.0 Netflix Hystrix

The Steeltoe Hystrix framework enables application developers to isolate and manage back-end dependencies so that a single failing dependency does not take down the entire application. This is accomplished by wrapping all calls to external dependencies in a `HystrixCommand` which is able to execute in its own separate external thread.

Hystrix maintains its own small fixed size thread-pool from which commands are executed.  When the pool becomes exhausted, Hystrix commands will be immediately rejected, and if provided, a fallback mechanism is executed.  This prevents any single dependency from using up all of the threads for failing external dependencies.

Each Hystrix command also has the ability to time-out calls which are taking longer than the threshold provided when the command was configured. If a time-out occurs, the command will automatically execute a fallback mechanism if provided by the developer. Developers can configure each command with custom fallback logic that will be executed whenever a command fails, is rejected, times-out or trips the circuit-breaker.

Each command has a built-in configurable circuit-breaker that will stop all requests to failing back-end dependencies when the error percentage passes a threshold. The circuit will remain open for a configurable period of time, and all requests will then be sent to the fallback mechanism until the circuit is closed again.

Hystrix also provides a means to measure command successes, failures, timeouts, short-circuits, and thread rejections. Statistics are gathered for all of these and can optionally be reported to a [Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) for monitoring in real-time.

All of these features are described in more detail in the upcoming sections. Also, it important to understand that the Steeltoe Hystrix implementation follows the Netflix implementation closely.  As a result, its very worthwhile to review the [Netflix documentation](https://github.com/Netflix/Hystrix/wiki) in addition to the sections which follow.

The Steeltoe Hystrix framework supports the following .NET application types:

* ASP.NET - MVC, WebForm, WebAPI, WCF
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

The source code for the Hystrix framework can be found [here](https://github.com/SteeltoeOSS/CircuitBreaker).

## 1.1 Quick Start

This quick start makes use of two ASP.NET Core applications to illustrate how to use the Steeltoe Hystrix framework and the Hystrix Dashboard. In addition to using Hystrix, each application also uses the Steeltoe Discovery client to register and fetch services from a Eureka Server running locally on your development machine.

Later on in the quick start, after you have successfully run the applications locally, the quick start also walks you through taking that same set of applications and pushing them to Cloud Foundry and making use of a Eureka Server and Hystrix Dashboard operating there.

The application consists of two components; a Fortune-Teller-Service which registers a FortuneService in a Eureka Server and a Fortune-Teller-UI which discovers the service and uses a Hystrix command to fetch Fortunes from it. The Fortune-Teller-UI has also been configured to gather metrics about the commands execution and to report those metrics to a Hystrix Dashboard.

### 1.1.1  Start Eureka Server Locally

In this step, we will fetch a repository from which we can start up a Netflix Eureka Server locally on our desktop. This server has been pre-configured to listen for service registrations and discovery requests at  <http://localhost:8761/eureka> .

```bash
> git clone https://github.com/spring-cloud-samples/eureka.git
>
> # Startup Eureka Server
> cd eureka
> mvnw spring-boot:run
```

### 1.1.2  Start Hystrix Dashboard Locally

In this step, we will fetch a repository from which we use to start up a Netflix Hystrix Dashboard locally on our desktop. This dashboard has been setup to listen for requests at <http://localhost:7979/>.  We will use it later on in the Quick start.

```bash
> git clone (https://github.com/spring-cloud-samples/hystrix-dashboard.git
>
> # Startup Hystrix Dashboard
> cd hystrix-dashboard
> mvnw spring-boot:run
```

### 1.1.3 Get Sample

To locate the sample you will need clone the repository from GitHub and checkout the v1.x branch.

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples
> git checkout v1.x
```

### 1.1.4 Run Fortune-Teller-Service

Use the dotnet CLI to run the application. Note below we show how to run the app on both of the frameworks the sample supports. Just pick one in order to proceed.

```bash
> # Make sure your in correct directory
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-Service
>
> dotnet restore --configfile nuget.config
>
> # Run on .NET Core
> dotnet run -f netcoreapp2.0  --server.urls http://*:5000
>
> # Run on .NET Framework on Windows
> dotnet run -f net461  --server.urls http://*:5000
```

### 1.1.5 Observe Logs

When you start the Fortune-Teller-Service, you should see something like the following:

```bash
> dotnet run -f netcoreapp2.0 --server.urls http://*:5000
info: Microsoft.Data.Entity.Storage.Internal.InMemoryStore[1]
      Saved 50 entities to in-memory store.
Hosting environment: Production
Now listening on: http://*:5000
Application started. Press Ctrl+C to shut down.
```

At this point the Fortune-Teller-Service is up and running and ready for the Fortune-Teller-UI to ask for fortunes.

### 1.1.6 Run Fortune-Teller-UI

Use the dotnet CLI to run the application. Note below we show how to run the app on both of the frameworks the sample supports. Just pick one in order to proceed.

```bash
> # Set BUILD environment variable
> SET BUILD=LOCAL or export BUILD=LOCAL
>
> # Make sure your in correct directory
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-UI
>
> dotnet restore --configfile nuget.config
>
>  # Run on .NET Core
> dotnet run -f netcoreapp2.0  --server.urls http://*:5555
>
>  # Run on .NET Framework on Windows
> dotnet run -f net461  --server.urls http://*:5555
```

### 1.1.7 Observe Logs

When you startup the Fortune-Teller-UI, you should see something like the following:

```bash
> dotnet run -f netcoreapp2.0 --server.urls http://*:5555
Hosting environment: Production
Now listening on: http://*:5555
Application started. Press Ctrl+C to shut down.
```

### 1.1.8 What to expect

Fire up a browser and hit <http://localhost:5555>.  You should see your fortune displayed. Refresh the browser to see a new fortune.

In addition to hitting <http://localhost:5555>, you can also hit: <http://localhost:5555/#/multiple> to cause the UI to make use of a Hystrix Collapser to obtain multiple fortunes.

### 1.1.9 Using Hystrix Dashboard

Fire up a browser and hit <http://localhost:7979>.  You should see the Hystrix Dashboard displayed. Configure the dashboard to view the Hystrix metrics captured from the Fortune-Teller-UI using the following steps:

1. In the first field on the dashboard, enter: `http://localhost:5555/hystrix/hystrix.stream`. This is the endpoint in the Fortune-Teller-UI that the Steeltoe Hystrix framework is using to expose the Hystrix metrics.
1. Click the monitor button on the dashboard to configure it.
1. Go back to the Fortune-Teller-UI application and obtain several fortunes.  Observe the values changing in the Hystrix dashboard as you obtain fortunes.  Click the refresh button on the UI app quickly to see the dashboard update.

### 1.1.10 Start Eureka Server Cloud Foundry

Starting with this step, we begin to setup the applications to run on Cloud Foundry. First, we use the Cloud Foundry CLI to create a service instance of the Spring Cloud Eureka Server on Cloud Foundry.

```bash
# Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
# Create a Eureka Server instance on Cloud Foundry
> cf create-service p-service-registry standard myDiscoveryService
>
# Wait for the service to become ready
> cf services
```

### 1.1.11 Start Hystrix Dashboard Cloud Foundry

Next we use the Cloud Foundry CLI to create a service instance of the Spring Cloud Hystrix Dashboard on Cloud Foundry.

```bash
# Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
# Create a Hystrix Dashboard instance on Cloud Foundry
> cf create-service p-circuit-breaker-dashboard standard myHystrixService
>
# Wait for the service to become ready
> cf services
```

### 1.1.12 Publish Fortune-Teller-Service

Use the `dotnet` CLI to build and publish the Fortune-Teller-Service.

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```bash
> # Make sure your in correct directory
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-Service
>
> # Publish for Linux, .NET Core
> dotnet publish -f netcoreapp2.0 -r ubuntu.14.04-x64
>
> # Publish for Windows, .NET Core
> dotnet publish -f netcoreapp2.0 -r win10-x64
>
> # Publish for Windows, .NET Framework
> dotnet publish -f net461 -r win10-x64
```

### 1.1.13 Push Fortune-Teller-Service

Use the Cloud Foundry CLI to push the published Fortune-Teller-Service to Cloud Foundry.

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```bash
> # Target an org and space on Cloud Foundry
> cf target -o myorg -s development
>
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.0/ubuntu.14.04-x64/publish
>
>  # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.0/win10-x64/publish
>
>  # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

Note that the manifests have been defined to bind the Fortune-Teller-Service to `myDiscoveryService` created above.

### 1.1.14 Publish Fortune-Teller-UI

Use the `dotnet` CLI to build and publish the Fortune-Teller-UI.

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

Note: Make sure the `BUILD` environment variable you set earlier is no longer set to `LOCAL`.

```bash
> # Remove previously set BUILD environment variable
> SET BUILD= or unset BUILD
>
> # Make sure your in correct directory
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-UI
>
> # Restore packages
> dotnet restore --configfile nuget.config
>
> # Publish for Linux, .NET Core
> dotnet publish -f netcoreapp2.0 -r ubuntu.14.04-x64
>
> # Publish for Windows, .NET Core
> dotnet publish -f netcoreapp2.0 -r win10-x64
>
> # Publish for Windows, .NET Framework
> dotnet publish -f net461 -r win10-x64
```

### 1.1.15 Push Fortune-Teller-UI

Use the Cloud Foundry CLI to push the published Fortune-Teller-UI to Cloud Foundry.

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```bash
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.0/ubuntu.14.04-x64/publish
>
>  # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.0/win10-x64/publish
>
>  # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

Note that the manifests have been defined to bind the Fortune-Teller-UI to `myDiscoveryService` and `myHystrixService` created above.

### 1.1.16 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs fortuneService` or `cf logs fortuneui`)

On a Linux cell, you should see something like this during startup. On Windows cells you will see something slightly different.

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

### 1.1.17 What to expect

Fire up a browser and hit <https://fortuneui.x.y.z> where `x.y.z` corresponds to the Cloud Foundry application domain that you are operating under.

You should see your fortune displayed. Refresh the browser to see a new fortune.

In addition to hitting <https://fortuneui.x.y.z>, you can also hit: <https://fortuneui.x.y.z/#/multiple> to cause the UI to make use of a Hystrix Collapser to obtain multiple fortunes.

### 1.1.18 Using the Hystrix Dashboard

Open a browser and connect to the Pivotal Apps Manager. You will have to use a link that is specific to your Cloud Foundry setup. (e.g. <https://apps.system.testcloud.com/>)

Follow [these instructions](https://docs.pivotal.io/spring-cloud-services/1-4/common/circuit-breaker/using-the-dashboard.html) to open the Hystrix dashboard on Cloud Foundry.

Go back to the Fortune-Teller-UI application and obtain several fortunes.  Observe the values changing in the Hystrix dashboard.  Click the refresh button on the UI app quickly to see the dashboard update.

### 1.1.19 Understand Sample

To understand the changes needed to utilize the Steeltoe Hystrix framework you should have a look at the Fortune-Teller-UI application.

Fortune-Teller-UI was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) and then modified to make use of the Steeltoe frameworks.

To gain an understanding of the Steeltoe Hystrix related changes to the generated template code, examine the following files:

* `Fortune-Teller-UI.csproj`- Contains `PackageReference` for Steeltoe Hystrix NuGet `Steeltoe.CircuitBreaker.Hystrix`. It also contains references to `Steeltoe.CircuitBreaker.Hystrix.MetricsStream` when targeting Cloud Foundry or `Steeltoe.CircuitBreaker.Hystrix.MetricsEvents` when running locally. These last two packages are used to expose Hystrix metrics to the dashboard.
* `appsettings.json` - Contains configuration data to name the Hystrix thread pool (i.e. `FortuneServiceTPool`)  which is used by the `FortuneServiceCommand` command. This name will become visible in the dashboard. It also contains a configuration value for the `FortuneServiceCollapser` used to obtain multiple fortunes.
* `FortuneServiceCommand.cs` - This is the code that implements the Hystrix command which is used to retrieve fortunes.  It has `RunAsync()` and `RunFallbackAsync()` methods which implement the commands logic.
* `FortuneServiceCollapser.cs` - This is the code that implements the Hystrix Collapser which is used to illustrate how to use a Collapser to retrieve multiple fortunes.  It has `CreateCommand()` and `MapResponseToRequests()` methods which implement the Collapser logic.
* `MultiFortuneServiceCommand` - This is the Hystrix Command that the Collapser uses to obtain multiple fortunes.
* `HomeController.cs` - Uses the injected Hystrix command `FortuneServiceCommand` to obtain a fortunes and return them to the browser.
* `Startup.cs`- Multiple changes were made as follows:
  * Code was added to the `ConfigureServices()` method to add a Hystrix Command `FortuneServiceCommand` to the service container.
  * Code was added to the `ConfigureServices()` method to add a Hystrix Collapser `FortuneServiceCollapser` to the service container.
  * Code was also added to expose Hystrix metrics to the dashboard by calling `AddHystrixMetricsStream()`.
  * Next in the `Configure()` method, code was added to cause the Hystrix Metrics stream to start communicating with the Hystrix dashboard (i.e. `UseHystrixMetricsStream()`)
  * Also in the `Configure()` method, in order to use request level logging and metrics, code was added to setup a Hystrix request context for each incoming request in the pipeline (i.e. `UseHystrixRequestContext()`) .
  * And finally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry configuration values when pushed to Cloud Foundry.

## 1.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the Hystrix framework. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the framework.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services and the middleware used in the app. Specifically pay particular attention to the usage of the `Configure()` and `ConfigureServices()` methods.

In addition to the information below, review the [Netflix Hystrix Wiki](https://github.com/Netflix/Hystrix/wiki). The Steeltoe Hystrix framework implementation aligns closely with the Netflix implementation, and as such, the Wiki information is very relevant when it comes to Steeltoe.

If you plan on using the Hystrix Dashboard, you should also spend time understanding the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) information on the wiki.

In order to use the Steeltoe framework you need to do the following:

* Add Hystrix NuGet package references to your project.
* Define Hystrix Command(s) and/or Hystrix Collapser(s)
* Configure Hystrix settings.
* Add Hystrix Command(s) and/or Collapser(s) to the container.
* Use Hystrix Command(s) and/or Collapser(s) to invoke dependent services.
* Add and Use the Hystrix metrics stream service.

### 1.2.1 Add NuGet References

There are three main Hystrix NuGets that you can choose from depending on your needs.

The first, and main package that you will always need to use is the  `Steeltoe.CircuitBreaker.Hystrix` package. This package contains everything you need in order to define and use Hystrix commands and collapser in your application.

To use this in your project add the following `PackageReference`:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix" Version= "1.1.0"/>
...
</ItemGroup>
```

Note: By referencing the above package, you will also pull in the `Steeltoe.CircuitBreaker.Hystrix.Core` package.

If you plan on using Hystrix metrics and you want to use the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) then you should also include the `Steeltoe.CircuitBreaker.Hystrix.MetricsEvents` package.

To do this include the following `PackageReference` in your application:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix.MetricsEvents" Version= "1.1.0"/>
...
</ItemGroup>
```

Alternatively, if you will be pushing your application to Cloud Foundry and you want to use the [Spring Cloud Services Hystrix Dashboard](https://docs.pivotal.io/spring-cloud-services/1-3/common/circuit-breaker/), then you should include the `Steeltoe.CircuitBreaker.Hystrix.MetricsStream` package instead of the one above.

To do this include the following `PackageReference` in your application:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix.MetricsEvents" Version= "1.1.0"/>
...
</ItemGroup>
```

Note: For an example of how to setup a `.csproj` file to conditionally include `MetricsStream` or `MetricsEvents` depending on environment variable settings, see [Fortune-Teller-UI.csproj](https://github.com/SteeltoeOSS/Samples/blob/master/CircuitBreaker/src/AspDotNetCore/FortuneTeller/Fortune-Teller-UI/Fortune-Teller-UI.csproj)

### 1.2.2 Define Hystrix Commands

There are many ways to define a Hystrix command. The simplest looks like this:

```csharp
public class HelloWorldCommand : HystrixCommand<string>
{
    public HelloWorldCommand(string name)
        : base(HystrixCommandGroupKeyDefault.AsKey("HelloWorldGroup"),
                () => { return "Hello" + name; },
                () => { return "Hello" + name + " via fallback"; })
    {
    }
}
```

Each command needs to inherit from `HystrixCommand` or `HystrixCommand<T>` and override and implement the inherited protected method `RunAsync()`. Optionally, the command developer can also override and implement the inherited method  `RunFallbackAsync()`.

The `RunAsync()` method implements the fundamental logic of the command, and the `RunFallbackAsync()` method implements the fallback logic.

Also, each command must be a member of a group.  The group is specified using the `HystrixCommandGroupKeyDefault.AsKey("HelloWorldGroup")` and must be provided in the constructor.

Below is the command above rewritten using the method overrides:

```csharp
public class HelloWorldCommand : HystrixCommand<string>
{
    private string _name;
    public HelloWorldCommand(string name)
        : base(HystrixCommandGroupKeyDefault.AsKey("HelloWorldGroup"))
    {
        _name = name;
    }

    protected override async Task<string> RunAsync()
    {
        return await Task.FromResult("Hello" + _name);
    }
    protected override async Task<string> RunFallbackAsync()
    {
        return await Task.FromResult("Hello" + _name + " via fallback");
    }
}

```

It's important to understand that `HystrixCommands` are state-ful objects and as such once it has been executed, it can no longer be reused.  You will have to create another instance (e.g. `new MyCommand()` ) of it if you want to execute it again.

### 1.2.3 Command Settings

Each Hystrix command that you define and use can be individually configured using normal .NET configuration services. Everything from thread-pool sizes and command time-outs to circuit-breaker thresholds can be specified.

For each Hystrix setting, there are four types of settings and levels of precedence that are followed and applied by the framework:

1. `Fixed global command settings` - these are defaults for all Hystrix commands. These settings will be used if nothing else is specified.
1. `Configured global command settings` - these are defaults specified in configuration files that override the fixed values above and apply to all Hystrix commands.
1. `Command settings specified in code` - these are settings you specify in the constructor of your Hystrix command. These settings will apply to that specific instance.
1. `Configured command specific settings` - these are settings specified in configuration files that are targeted at named commands and will apply to all instances created with that name.

All configured Hystrix settings should be placed under the prefix with the key `hystrix:command:`

All configured global settings, as described in #2 above, should be placed under the prefix `hystrix:command:default:`. Here is an example which configures the default timeout for all commands to be 750 milliseconds: `hystrix:command:default:execution:isolation:thread:timeoutInMilliseconds=750`

If you wish to configure the settings for a command in code, you will have to make use of the [`HystrixCommandOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.Hystrix.Core/HystrixCommandOptions.cs) found in the `Steeltoe.CircuitBreaker.Hystrix.Core` package. More information on how to use this type and configure command settings in will follow in later sections.

All configured command specific settings, as described in #4 above, should be placed under the prefix `hystrix:command:HYSTRIX_COMMAND_KEY:`, where `HYSTRIX_COMMAND_KEY` is the "name" of the command. Here is an example which configures the timeout for the Hystrix command with the "name"=foobar to be 750 milliseconds:
`hystrix:command:foobar:execution:isolation:thread:timeoutInMilliseconds=750`

The following set of tables specify all of the possible settings by category.

Note that the settings provided below follow closely those implemented by the Netflix Hystrix implementation. As a result, to obtain a further understanding of each setting and how it affects Hystrix command operations, you are encouraged to read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki.

#### 1.2.3.1 Execution

These settings control how the HystrixCommand's `RunAsync()` method will be executed.  Each setting is prefixed with the key `execution`.

|Key|Description|
|------|------|
|**execution:timeout:enabled**|enable or disable `RunAsync()` timeouts, defaults = true|
|**execution:isolation:strategy**|THREAD or SEMAPHORE, defaults = THREAD|
|**execution:isolation:thread:timeoutInMilliseconds**|time allowed for `RunAsync()` execution completion, then fallback is executed, defaults = 1000|
|**execution:isolation:semaphore:maxConcurrentRequests**|maximum requests to `RunAsync()` method when using SEMAPHORE strategy, defaults = 10|

Example: `hystrix:command:foobar:execution:isolation:strategy=SEMAPHORE`

#### 1.2.3.2 Fallback

These settings control how the HystrixCommand's `RunFallbackAsync()` method will be executed.  Each setting is prefixed with the key `fallback`.

|Key|Description|
|------|------|
|**fallback:enabled**|enable or disable `RunFallbackAsync()`, defaults = true|
|**fallback:isolation:semaphore:maxConcurrentRequests**|maximum requests to `RunFallbackAsync()` method when using SEMAPHORE strategy, defaults = 10|

Example: `hystrix:command:foobar:fallback:enabled=false`

#### 1.2.3.3 Circuit Breaker

These settings control the behavior of the default Circuit Breaker used by Hystrix commands.  Each setting is prefixed with the key `circuitBreaker`.

|Key|Description|
|------|------|
|**circuitBreaker:enabled**|enable or disable circuit breaker usage, defaults = true|
|**circuitBreaker:requestVolumeThreshold**|minimum number of requests in a rolling window that will trip the circuit, defaults = 20|
|**circuitBreaker:sleepWindowInMilliseconds**|amount of time, after tripping the circuit, to reject requests before allowing attempts again, default = 5000|
|**circuitBreaker:errorThresholdPercentage**|error percentage at or above which the circuit should trip open and start short-circuiting requests to fallback logic, default = 50|
|**circuitBreaker:forceOpen**|force open circuit, default = false|
|**circuitBreaker:forceClosed**|force close circuit, default = false|

Example: `hystrix:command:foobar:circuitBreaker:enabled=false`

#### 1.2.3.4 Metrics

These settings control the behavior of capturing metrics from Hystrix commands.  Each setting is prefixed with the key `metrics`.

|Key|Description|
|------|------|
|**metrics:rollingStats:timeInMilliseconds**|duration of the statistical rolling window, used by circuit breaker and for publishing, defaults = 10000|
|**metrics:rollingStats:numBuckets**|number of buckets the rolling statistical window is divided into, defaults = 10|
|**metrics:rollingPercentile:enabled**|indicates whether execution latencies should be tracked and calculated as percentiles, default = true|
|**metrics:rollingPercentile:timeInMilliseconds**|duration of the rolling window in which execution times are kept to allow for percentile calculations, default = 60000|
|**metrics:rollingPercentile:numBuckets**|number of buckets the rollingPercentile window will be divided into, default = 6|
|**metrics:rollingPercentile:bucketSize**|maximum number of execution times that are kept per bucket, default = 100|
|**metrics:healthSnapshot:intervalInMilliseconds**| time to wait between allowing health snapshots to be taken that calculate success and error percentages affecting circuit breaker status, default = 500|

Example: `hystrix:command:foobar:metrics:rollingPercentile:enabled=false`

#### 1.2.3.5 Request Cache

These settings control whether Hystrix command request caching is enabled or disabled. Each setting is prefixed with the key `requestCache`.

|Key|Description|
|------|------|
|**requestCache:enabled**|enable or disable request scoped caching, defaults = true|

#### 1.2.3.6 Request Logging

These settings control whether Hystrix command execution events are logged to the Request log. Each setting is prefixed with the key `requestLog`.

|Key|Description|
|------|------|
|**requestLog:enabled**|enable or disable request scoped logging, defaults = true|

Example: `hystrix:command:foobar:fallback:enabled=false`

#### 1.2.3.7 Thread Pool

These settings control what and how the command uses the Hystrix thread pools.

|Key|Description|
|------|------|
|**threadPoolKeyOverride**|set the thread pool used by the command, defaults = command group key name|

Example: `hystrix:command:foobar:threadPoolKeyOverride=FortuneServiceTPool`

### 1.2.4 Thread Pool Settings

In addition to configuring the settings for Hystrix commands, you can also configure settings Steeltoe Hystrix will use in creating and managing its thread pools.

In most cases, you will be able to take the defaults and not have to configure these settings.

Just like for Hystrix command settings, there are four types of settings and levels of precedence that are followed and applied by the framework:

1. `Fixed global pool settings` - these are defaults for all Hystrix pools. These settings will be used if nothing else is specified.
1. `Configured global pool settings` - these are defaults specified in configuration files that override the fixed values above and apply to all Hystrix pools.
1. `Pool settings specified in code` - these are settings you specify in the constructor of your Hystrix thread pool. These settings will apply to all commands that are created that reference that pool.
1. `Configured pool specific settings` - these are settings specified in configuration files that are targeted at named thread pools and will apply to all commands that are created that reference that pool.

All configured thread pool settings should be placed under the prefix with the key `hystrix:threadpool:`

All configured global settings, as described in #2 above, should be placed under the prefix `hystrix:threadpool:default:`. Here is an example which configures the default number of threads in all thread pools to be 20: `hystrix:threadpool:default:coreSize=20`

If you wish to configure the settings for a thread pool in code, you will have to make use of the [`HystrixThreadPoolOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.Hystrix.Core/HystrixThreadPoolOptions.cs) type found in the `Steeltoe.CircuitBreaker.Hystrix.Core` package. More information on how to use this type and configure thread pool settings will follow in later sections.

All configured pool specific settings, as described in #4 above, should be placed under the prefix `hystrix:threadpool:HYSTRIX_THREADPOOL_KEY:`, where `HYSTRIX_THREADPOOL_KEY` is the "name" of the thread pool. Note that the default name of the thread pool used by a command, if not overridden, will be the command group name applied to the command. Here is an example which configures the number of threads for the Hystrix thread pool with the "name"=foobar to be 40:
`hystrix:threadpool:foobar:coreSize=40`

The following tables specify all of the possible settings.

Note that the settings provided below follow closely those implemented by the Netflix Hystrix implementation. As a result, to obtain a further understanding of each setting and how it affects Hystrix thread pool operations, you are encouraged to read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki.

#### 1.2.4.1 Sizing

These settings control the sizing of various aspects of the thread pool.  There is no additional prefix used in these settings.

|Key|Description|
|------|------|
|**coreSize**|sets the thread pool size, defaults = 10|
|**maximumSize**|maximum size of threadPool - see allowMaximumSizeToDivergeFromCoreSize, defaults = 10|
|**maxQueueSize**|maximum thread pool queue size, value=-1 uses sync queue, default = -1|
|**queueSizeRejectionThreshold**|sets the queue size rejection threshold — an artificial maximum queue size at which rejections will occur even if maxQueueSize has not been reached, doesn't apply if maxQueueSize=-1, default = 5|
|**keepAliveTimeMinutes**|currently not used, default = 1|
|**allowMaximumSizeToDivergeFromCoreSize**|allows the configuration for maximumSize to take effect, default = false|

Example: `hystrix:threadPool:foobar:coreSize=20`

#### 1.2.4.2 Metrics

These settings control the behavior of capturing metrics from Hystrix thread pools.  Each setting is prefixed with the key `metrics`.

|Key|Description|
|------|------|
|**rollingStats.timeInMilliseconds**|duration of the statistical rolling window, defines how long metrics are kept for the thread pool, default = 10000|
|**rollingStats.numBuckets**|number of buckets the rolling statistical window is divided into, default = 10|

Example: `hystrix:threadpool:foobar:metrics:rollingStats:timeInMilliseconds=20000`

### 1.2.5 Collapser Settings

The last group of settings you can configure pertain to the usage of a Hystrix collapser.

Just like for all other Hystrix settings, there are four types of settings and levels of precedence that are followed and applied by the framework:

1. `Fixed global collapser settings` - these are defaults for all Hystrix collapsers. These settings will be used if nothing else is specified.
1. `Configured global collapser settings` - these are defaults specified in configuration files that override the fixed values above and apply to all Hystrix collapsers.
1. `Collapser settings specified in code` - these are settings you specify in the constructor of your Hystrix collapser. These settings will apply to all collapsers that are created that reference that set of options.
1. `Configured collapser specific settings` - these are settings specified in configuration files that are targeted at named collapsers and will apply to all that are created with that name.

All configured collapser settings should be placed under the prefix with the key `hystrix:collapser:`

All configured global settings, as described in #2 above, should be placed under the prefix `hystrix:collapser:default:`. Here is an example which configures the default number of milliseconds after which a batch of requests that have been created by the collapser will trigger and execute all of the requests: `hystrix:collapser:default:timerDelayInMilliseconds=20`

If you wish to configure the settings for a collapser in code, you will have to make use of the [`HystrixCollapserOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.Hystrix.Core/HystrixCollapserOptions.cs) found in the `Steeltoe.CircuitBreaker.Hystrix.Core` package. More information on how to use this type to configure settings will follow in later sections.

All configured collapser specific settings, as described in #4 above, should be placed under the prefix `hystrix:collapser:HYSTRIX_COLLAPSER_KEY:`, where `HYSTRIX_COLLAPSER_KEY` is the "name" of the collapser. Note that the default name of the collapser, if not specified, will be the type name of the collapser. Here is an example which configures the number of milliseconds after which a batch of requests that have been created by the collapser with the name "foobar" will trigger and execute all of the requests: `hystrix:collapser:foobar:timerDelayInMilliseconds=400`

The following tables specify all of the possible settings.

Note that the settings provided below follow closely those implemented by the Netflix Hystrix implementation. As a result, to obtain a further understanding of each setting and how it affects Hystrix collapser operations, you are encouraged to read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki.

#### 1.2.5.1 Sizing

These settings control the sizing of various aspects of collapsers.  There is no additional prefix used in these settings.

|Key|Description|
|------|------|
|**maxRequestsInBatch**|sets the max number of requests in a batch, defaults = INT32.MaxValue|
|**timerDelayInMilliseconds**|delay before a batch is executed, defaults = 10|
|**requestCacheEnabled**|indicates whether request cache is enabled, default = true|

Example: `hystrix:collapser:foobar:timerDelayInMilliseconds=400`

#### 1.2.5.2 Metrics

These settings control the behavior of capturing metrics from Hystrix collapsers.  Each setting is prefixed with the key `metrics`.

|Key|Description|
|------|------|
|**metrics:rollingStats:timeInMilliseconds**|duration of the statistical rolling window, used by circuit breaker and for publishing, defaults = 10000|
|**metrics:rollingStats:numBuckets**|number of buckets the rolling statistical window is divided into, defaults = 10|
|**metrics:rollingPercentile:enabled**|indicates whether execution latencies should be tracked and calculated as percentiles, default = true|
|**metrics:rollingPercentile:timeInMilliseconds**|duration of the rolling window in which execution times are kept to allow for percentile calculations, default = 60000|
|**metrics:rollingPercentile:numBuckets**|number of buckets the rollingPercentile window will be divided into, default = 6|
|**metrics:rollingPercentile:bucketSize**|maximum number of execution times that are kept per bucket, default = 100|

Example: `hystrix:collapser:foobar:metrics:rollingPercentile:enabled=false`

### 1.2.6 Configure Settings

The most convenient way to configure settings for Hystrix is to put them in a file and then use one of the file based .NET configuration providers to read them in.

Below is an example of some Hystrix settings in JSON which configure the `FortuneService` command to use a thread pool with the name `FortuneServiceTPool`.

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
  },
  "hystrix": {
    "command": {
      "FortuneService": {
        "threadPoolKeyOverride": "FortuneServiceTPool"
      }
    }
  }
  .....
}
```

Once the Hystrix settings have been defined and put in a file, then the next step is to get them read in so they can be made available to the Hystrix commands.

Using the code below, you can see that the configuration settings from above should be put in `appsettings.json` and included with the application.  Then, by using the .NET provided JSON configuration provider we are able to read in the settings simply by adding the provider to the configuration builder (e.g. `AddJsonFile("appsettings.json")`.

```csharp

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Hystrix configuration
            .AddJsonFile("appsettings.json")

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ....
```

If you wanted to managed the settings centrally, you can use the Spring Cloud Config Server (i.e. `AddConfigServer()`), instead of a local JSON file (i.e. `AddJsonFile()`). Simply by putting the setting above in a github repository and configuring the Config server to serve its configuration data from that repository.

### 1.2.7 Add Commands

Once you have read in your configuration data, then you are at a point that you can add the Hystrix commands to the service container making them available for injection in your application.  There are several Steeltoe extension methods you can use to help you accomplish this.

Note that you do NOT need to add your commands to the container. Instead, you are free to just `new` them in code at any point in time in your application and make use of them.

But, if you do want to have them injected, then you can do this in the `ConfigureServices()` method of the `Startup` class. Simply make use of the `AddHystrixCommand()` extension methods provided by the Steeltoe package.

Here is an example:

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

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

        // Add Hystrix command FortuneService to Hystrix group "FortuneService"
        services.AddHystrixCommand<FortuneServiceCommand>("FortuneService", Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }

    ....
```

There is one important requirement you must follow if you wish to use the `AddHystrixCommand()` extension methods. When you define your HystrixCommand, you need to make sure you define a public constructor for your command with the first argument a `IHystrixCommandOptions`. (i.e. `HystrixCommandOptions`).  You don't need to create or populate the contents `IHystrixCommandOptions`; instead the `AddHystrixCommand()` extension method will do that for you by using the configuration data you provide in the method call.

Here is an example illustrating how to define a compatible constructor.  Notice that `FortuneServiceCommand` inherits from `HystrixCommand<Fortune>`; its a command which returns results of type `Fortune`.  Notice that the constructor has, as a first argument, `IHystrixCommandOptions` and also note you can add additional constructor arguments; but the first must be a `IHystrixCommandOptions`.

```csharp
public class FortuneServiceCommand : HystrixCommand<Fortune>
{
    IFortuneService _fortuneService;
    ILogger<FortuneServiceCommand> _logger;

    public FortuneServiceCommand(IHystrixCommandOptions options,
        IFortuneService fortuneService, ILogger<FortuneServiceCommand> logger) : base(options)
    {
        _fortuneService = fortuneService;
        _logger = logger;
        IsFallbackUserDefined = true;
    }
}
```

### 1.2.8 Use Commands

If you have used the `AddHystrixCommand()` extension methods described earlier, then all you need to do to get an instance of the command in your controllers or views is to add the command as an argument in the constructor.

Here is an example controller that makes use of a Hystrix command `FortuneServiceCommand` which was added to the container using `AddHystrixCommand<FortuneServiceCommand>("FortuneService", Configuration)`.

The controller uses the `RandomFortuneAsync()` method on the injected command to retrieve a fortune.

```csharp
public class HomeController : Controller
{
    FortuneServiceCommand _fortuneServiceCommand;

    public HomeController(FortuneServiceCommand fortuneServiceCommand)
    {
        _fortuneServiceCommand = fortuneServiceCommand;
    }

    [HttpGet("random")]
    public async Task<Fortune> Random()
    {
        return await _fortuneServiceCommand.RandomFortuneAsync();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    }
}
```

Below is the definition of the Hystrix command used above. As you can see, the `FortuneServiceCommand` class is a Hystrix command and it is intended to be used in retrieving Fortunes from a Fortune micro-service. It uses another service, `IFortuneService` to actually make the request.

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

public class FortuneServiceCommand : HystrixCommand<Fortune>
{
    IFortuneService _fortuneService;
    ILogger<FortuneServiceCommand> _logger;

    public FortuneServiceCommand(IHystrixCommandOptions options,
        IFortuneService fortuneService, ILogger<FortuneServiceCommand> logger) : base(options)
    {
        _fortuneService = fortuneService;
        _logger = logger;
        IsFallbackUserDefined = true;
    }
    public async Task<Fortune> RandomFortuneAsync()
    {
        return await ExecuteAsync();
    }
    protected override async Task<Fortune> RunAsync()
    {
        var result = await _fortuneService.RandomFortuneAsync();
        _logger.LogInformation("Run: {0}", result);
        return result;
    }

    protected override async Task<Fortune> RunFallbackAsync()
    {
        _logger.LogInformation("RunFallback");
        return await Task.FromResult<Fortune>(new Fortune() { Id = 9999, Text = "You will have a happy day!" });
    }
}
```

First, notice above that the `FortuneServiceCommand` constructor takes a `IHystrixCommandOptions` as a parameter. This is the command configuration that is used by the command and has been previously populated with configuration data read during `Startup`.

Second, notice the two protected methods `RunAsync()` and `RunFallbackAsync()`. These are the worker methods for the command and they ultimately do the work the Hystrix command is intended to do.

The `RunAsync()` method uses the `IFortuneService` to make a REST request of the Fortune micro-service returning the result as a `Fortune`.  The `RunFallbackAsync()` method just returns a hard coded `Fortune`.

To invoke the command, the controller code simply invokes the async method `RandomFortuneAsync()` to start command execution. This simply calls the HystrixCommand implemented method `ExecuteAsync`.

You have multiple ways in which you can cause commands to begin executing.

To execute a command synchronously you can make use of the commands `Execute()` method:

```csharp
var command = new FortuneServiceCommand(....);
var result = command.Execute();
```

To execute a command asynchronously, you can make use of the `ExecuteAsync()` method:

```csharp
var command = new FortuneServiceCommand(....);
var result = await command.ExecuteAsync();
```

You can also use Rx.NET extensions and observe the results of a command by using the `Observe()` method.  The `Observe()` method returns a `hot` observable which will have already started execution.

```csharp
var command = new FortuneServiceCommand(....);
IObservable<Fortune> observable = command.Observe();
var result = await observable.FirstOrDefaultAsync();
```

Alternatively, you can use the `ToObservable()` method to return a `cold` observable of the command and will not have started.  Then, when you `Subscribe()` to it, the underlying command will begin execution and the results will be made available in the Observers `OnNext(result)` method.

```csharp
var command = new FortuneServiceCommand(....);
IObservable<Fortune> cold = command.ToObservable();
IDisposable subscription = cold.Subscribe( (result) => { Console.WriteLine(result); });
```

### 1.2.9 Add Collapsers

In addition to Hystrix commands, you also might want to use Hystrix collapsers in your applications. Hystrix collapsers enable you to collapse multiple requests into a batch that can then be executed by a single underlying HystrixCommand.

Collapsers can be configured to use a batch size and/or an elapsed time since the creation of a batch of request as triggers for executing underlying Hystrix command.

There are two styles of request-collapsing supported by Hystrix; `request-scoped` and `globally-scoped`. This is configured when you construct the collapser and defaults to `request-scoped`. A `request-scoped` collapser collects a batch of requests per HystrixRequestContext, while a `globally-scoped` collapser collects a batch across multiple HystrixRequestContexts.

Just like Hystrix commands, you can also add a Hystrix collapsers to the service container making them available for injection in your application.  There are several Steeltoe extension methods you can use to help you accomplish this.

Note that you do NOT need to add your collapser to the container, and instead, you are free to just `new` them in code at any point in time in your application and make use of them.

If you do want to have them injected, then you can do this in the `ConfigureServices()` method of the `Startup` class. Simply make use of the `AddHystrixCollapser()` extension methods provided by the Steeltoe package.

Here is an example:

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

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

        // Add Hystrix collapser to the service container
        services.AddHystrixCollapser<FortuneServiceCollapser>("FortuneServiceCollapser", Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }

    ....
```

Just like with Hystrix commands, there is an important requirement you must follow if you wish to use the `AddHystrixCollapser()` extension methods. When you define your HystrixCollapser, you need to make sure you define a public constructor with the first argument a `IHystrixCollapserOptions`. (i.e. `HystrixCollapserOptions`).  You don't need to create or populate its contents; instead the `AddHystrixCollapser()` extension method will do that for you by using the configuration data you provide in the method call.

Here is an example illustrating how to define a compatible constructor.  Notice that `FortuneServiceCollapser` inherits from `HystrixCollapser<List<Fortune>, Fortune, int>`; its a collapser which returns results of type `List<Fortune>`.  Notice that the constructor has, as a first argument, `IHystrixCollapserOptions` and also note you can add additional constructor arguments; but the first must be a `IHystrixCollapserOptions`.

```csharp
public class FortuneServiceCommand  : HystrixCollapser<List<Fortune>, Fortune, int>,
{
    ILogger<FortuneServiceCollapser> _logger;
    ILoggerFactory _loggerFactory;
    IFortuneService _fortuneService;

    public FortuneServiceCollapser(IHystrixCollapserOptions options,
        IFortuneService fortuneService, ILoggerFactory logFactory) : base(options)
    {
        _logger = logFactory.CreateLogger<FortuneServiceCollapser>();
        _loggerFactory = logFactory;
        _fortuneService = fortuneService;
    }
}
```

### 1.2.10 Use Collapsers

You use Hystrix collapsers in a similar way to the way you use Hystrix commands.  If you have added the collapser to the service container, then you can inject it into any controller, view or other services created by the container.

Here is an example controller that makes use of a Hystrix collapser `FortuneServiceCollapser` which was added to the container using `AddHystrixCollapser<FortuneServiceCollapser>("FortuneCollapser", Configuration)`.

The controller uses the `ExecuteAsync()` method on the injected command to retrieve a fortune by `Id`.

```csharp
public class HomeController : Controller
{
    FortuneServiceCollapser _fortuneService;

    public HomeController(FortuneServiceCollapser fortuneService)
    {
        _fortuneService = fortuneService;
    }

    [HttpGet("random")]
    public async Task<Fortune> Random()
    {
        // Fortune IDs are 1000-1049
        int id = random.Next(50) + 1000;
        return GetFortuneById(id);
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    protected Task<Fortune> GetFortuneById(int id)
    {
        // Use the FortuneServiceCollapser to obtain a Fortune by its Fortune Id
        _fortuneService.FortuneId = id;
        return _fortuneService.ExecuteAsync();
    }

}
```

Below is the definition of the Hystrix collapser used above. As you can see, the `FortuneServiceCollapser` class is a Hystrix collapser and it is intended to be used in batching up requests for Fortunes and then executing a single Hystrix command `MultiFortuneServiceCommand` to return a `List<Fortune>`.

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

public class FortuneServiceCollapser : HystrixCollapser<List<Fortune>, Fortune, int>
{
    ILogger<FortuneServiceCollapser> _logger;
    ILoggerFactory _loggerFactory;
    IFortuneService _fortuneService;

    public FortuneServiceCollapser(IHystrixCollapserOptions options,
        IFortuneService fortuneService, ILoggerFactory logFactory) : base(options)
    {
        _logger = logFactory.CreateLogger<FortuneServiceCollapser>();
        _loggerFactory = logFactory;
        _fortuneService = fortuneService;
    }

    public virtual int FortuneId { get; set; }

    public override int RequestArgument { get { return FortuneId; } }

    protected override HystrixCommand<List<Fortune>> CreateCommand(ICollection<ICollapsedRequest<Fortune, int>> requests)
    {
        _logger.LogInformation("Creating MultiFortuneServiceCommand to handle {0} number of requests", requests.Count);
        return new MultiFortuneServiceCommand(
            HystrixCommandGroupKeyDefault.AsKey("MultiFortuneService"),
            requests,
            _fortuneService,
            _loggerFactory.CreateLogger<MultiFortuneServiceCommand>());
    }

    protected override void MapResponseToRequests(List<Fortune> batchResponse, ICollection<ICollapsedRequest<Fortune, int>> requests)
    {
        foreach(var f in batchResponse)
        {
            foreach(var r in requests)
            {
                if (r.Argument == f.Id)
                {
                    r.Response = f;
                }
            }
        }
    }
}
```

To understand how the collapser functions you first need to understand what happens during the processing of an incoming request. For each incoming request to the application, each separate execution of a `FortuneServiceCollapser` instance causes the Hystrix collapser to add a request into a batch of requests to be handed off to a `MultiFortuneServiceCommand` created by `CreateCommand()`.

Notice that `CreateCommand()` takes as an argument a collection of `ICollapsedRequest<Fortune, int>` requests. Each element of that collection represents a request for a specific `Fortune` by its Id (i.e. an Integer). `CreateCommand` returns the Hystrix command responsible for executing those requests and returning a list of `Fortunes` for those requests.

Next, notice the `MapResponseToRequests` method. After the `MultiFortuneServiceCommand` finishes, then some logic has to be applied which maps the `Fortunes` returned from the command (i.e. `List<Fortune> batchResponse`) to the individual requests (i.e. `ICollection<ICollapsedRequest<Fortune, int>> requests`) we started with.  Doing this enables each separate execution of a `FortuneServiceCollapser` instance that was used to 'queue up' a request to complete, and to return the `Fortune` that was requested by it.

Just like with Hystrix commands, you have multiple ways in which you can cause collapsers to begin executing.

To execute a collapser synchronously you can make use of the `Execute()` method:

```csharp
var collapser = new FortuneServiceCollapser(....);
var result = collapser.Execute();
```

To execute a collapser asynchronously, you can make use of the `ExecuteAsync()` method:

```csharp
var collapser = new FortuneServiceCollapser(....);
var result = await collapser.ExecuteAsync();
```

You can also use Rx.NET extensions and observe the results by using the `Observe()` method.  The `Observe()` method returns a `hot` observable which will have already started execution.

```csharp
var collapser = new FortuneServiceCollapser(....);
IObservable<Fortune> observable = collapser.Observe();
var result = await observable.FirstOrDefaultAsync();
```

Alternatively, you can use the `ToObservable()` method to return a `cold` observable which will not have started.  Then, when you `Subscribe()` to it, the underlying collapser will begin execution and the results will be made available in the Observers `OnNext(result)` method.

```csharp
var collapser = new FortuneServiceCollapser(....);
IObservable<Fortune> cold = collapser.ToObservable();
IDisposable subscription = cold.Subscribe( (result) => { Console.WriteLine(result); });
```

### 1.2.11 Use Metrics

As HystrixCommands execute, they generate metrics and status information on execution outcomes, latency and thread pool usage. This information can be very useful in monitoring and managing your applications. The Hystrix Dashboard enables you to extract and view these metrics in real time.

With Steeltoe, there are currently two dashboards you can choose from.

The first is the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard). This dashboard is appropriate when you are not running your application on Cloud Foundry.  For example, when you are developing and testing your application locally on your desktop.

The second is the [Spring Cloud Services Hystrix Dashboard](https://docs.pivotal.io/spring-cloud-services/1-4/common/circuit-breaker/).  This dashboard is part of the [Spring Cloud Services](https://docs.pivotal.io/spring-cloud-services/1-3/common/) offering and is made available to applications via the normal service instance binding mechanisms on Cloud Foundry.

Note, as described in the *Add NuGet References* section above, depending on which dashboard you are targeting, you will need to make sure you include the correct Steeltoe NuGet in your project.

The `Steeltoe.CircuitBreaker.Hystrix.MetricsEvents` package should be used when targeting the Netflix Hystrix Dashboard. When added to your app, it exposes a new REST endpoint in your application: `/hystrix/hystrix.stream`. This endpoint is used by the dashboard in receiving `SSE` metrics and status events from your application.

The `Steeltoe.CircuitBreaker.Hystrix.MetricsStream` package should be used when targeting the Spring Cloud Services Hystrix Dashboard. When added to your app, it starts up a background thread and uses messaging to push the metrics to the bound dashboard.

Regardless of which dashboard/package you choose to use, in order to enable your application to emit metrics and status information you will have to make three changes in your `Startup` class.

* Add Hystrix Metrics stream service to the service container
* Use Hystrix Request context middleware in pipeline
* Start Hystrix Metrics stream

To add the metrics stream to the service container you will need to use the `AddHystrixMetricsStream()` extension method in the `ConfigureService()` method in your `Startup` class.

```csharp
#using Steeltoe.CircuitBreaker.Hystrix;

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

        // Add Hystrix command FortuneService to Hystrix group "FortuneServices"
        services.AddHystrixCommand<IFortuneService, FortuneService>("FortuneServices", Configuration);

        // Add framework services.
        services.AddMvc();

        // Add Hystrix Metrics to container
        services.AddHystrixMetricsStream(Configuration);
        ...
    }

    ....
```

Next, you will need to configure a couple Hystrix related items in the request processing pipeline. This is done in `Configure()` method of the `Startup` class.

First, metrics requires that Hystrix Request contexts be initialized and available in every request being processed. You can enable this by using the Steeltoe extension method `UseHystrixRequestContext()` as shown below.

Additionally, in order to startup the metrics stream service, so that it starts to publish metrics and events, you need to call the `UseHystrixMetricsStream()` extension method.  See the contents of the `Configure()` method below.

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {
        ...
    }
    public void Configure(IApplicationBuilder app)
    {
        app.UseStaticFiles();

        // Use Hystrix Request contexts
        app.UseHystrixRequestContext();

        app.UseMvc();

        // Start Hystrix metrics stream service
        app.UseHystrixMetricsStream();
    }
    ....
```

#### 1.2.11.1 Netflix Dashboard

Once you have made the changes described above, you can then make use of the Netflix Hystrix Dashboard by following the instructions below.

1. Clone a Hystrix dashboard. (<https://github.com/spring-cloud-samples/hystrix-dashboard.git>)
1. Go to the cloned directory (`hystrix-dashboard`) and start it up with `mvn spring-boot:run`.
1. Open a browser and connect to the dashboard. (e.g. <http://localhost:7979>)
1. In the first field, enter the endpoint in the application that is exposing the hystrix metrics. (e.g. <http://localhost:5555/hystrix/hystrix.stream>).
1. Click the monitor button.
1. Use your application and see the metrics begin to flow in.

#### 1.2.11.2 Cloud Foundry Dashboard

When you want to use a Hystrix Dashboard on Cloud Foundry you must have previously installed Spring Cloud Services. If that has been done, then you can create and bind a instance of the dashboard to the application using the Cloud Foundry CLI as follows:

```bash
> cf target -o myorg -s development
>
> # Create Hystrix dashboard instance named `myHystrixService`
> cf create-service p-circuit-breaker-dashboard standard myHystrixService
>
> # Wait for service to become ready
> cf services
```

For more information on using the Hystrix Dashboard on Cloud Foundry, see the [Spring Cloud Services](https://docs.pivotal.io/spring-cloud-services/1-4/common/) documentation.

Once you have bound the service to your application, the Hystrix Dashboard settings will become available and be setup in `VCAP_SERVICES`.

In order for the settings to be picked up and put in the configuration of your application, you have to make use of the Steeltoe Cloud Foundry configuration provider.

To do that, simply add a `AddCloudFoundry()` method call to the `ConfigurationBuilder` in your `Startup` class.  Here is an example:

```csharp

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

Then when you push the application to Cloud Foundry, the Hystrix Dashboard settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`).

If there are any merge conflicts, then the service binding settings will take precedence and will override all others.

Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

Once you have performed the steps described above, and you have made the changes described in *Use Metrics* section above, you can make use of the Spring Cloud Services dashboard by following the instructions below:

1. Open a browser and connect to the Pivotal Apps Manager.
1. Follow [these instructions](https://docs.pivotal.io/spring-cloud-services/1-3/common/circuit-breaker/using-the-dashboard.html) to open the Hystrix Dashboard service.
1. Use your application and see the metrics begin to flow in.