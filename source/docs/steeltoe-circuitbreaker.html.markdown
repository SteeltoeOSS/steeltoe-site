---
title: Circuit Breaker
order: 60
date: 2016/4/1
tags:
---

The Steeltoe Circuit Breaker frameworks provide applications with an implementation of the Circuit Breaker pattern. Cloud-native architectures are typically composed of multiple layers of distributed services. End-user requests may comprise multiple calls to these services, and if a lower-level service fails, the failure can cascade up to the end user and spread to other dependent services. Heavy traffic to a failing service can also make it difficult to repair. By using Circuit Breaker frameworks, you can prevent failures from cascading and provide fallback behavior until a failing service is restored to normal operation.

![cb](/images/circuit-breaker-overview.png)

When applied to a service, a circuit breaker watches for failing calls to the service.  If failures reach a certain threshold, it “opens” the circuit and automatically redirects calls to the specified fallback mechanism. This gives the failing service time to recover.

There are several options to choose from when implementing the Circuit Breaker pattern. Steeltoe has initially chosen to support one based on Hystrix; Netflix's Latency and Fault Tolerance library for distributed systems. For more information about Hystrix see the [Netflix/Hystrix Wiki](https://github.com/Netflix/Hystrix/wiki) and the [Spring Cloud Netflix](http://cloud.spring.io/spring-cloud-netflix/spring-cloud-netflix.html) documentation.

In the future you can expect to see more Circuit Breaker options as part of the Steeltoe framework.

### 1.0 Netflix Hystrix
The Steeltoe Hystrix framework enables application developers to isolate and manage back-end dependencies so that a single failing dependency does not take down the entire application. This is accomplished by wrapping all calls to external dependencies in a `HystrixCommand` which is able to execute in its own separate external thread. 

Hystrix maintains its own small fixed size thread-pool from which commands are executed.  When the pool becomes exhausted, Hystrix commands will be immediately rejected, and if provided, a fallback mechanism is executed.  This prevents any single dependency from using up all of the server threads for failing external dependencies.

Each Hystrix command also has the ability to time-out calls which are taking a longer period of time than the threshold provided when configuring the command. If a time-out occurs, the command will automatically execute a fallback mechanism if provided by the developer.

Each command has a built-in configurable circuit-breaker the will stop all requests to failing back-end dependencies when the error percentage passes a threshold. The circuit will remain open for a configurable period of time, and all requests will then be sent to the fallback mechanism until the circuit is closed again. 

Developers can configure each command with custom fallback logic that will be executed whenever a command fails, is rejected, times-out or trips the circuit-breaker.

Hystrix also provides a means to measure command successes, failures, timeouts, short-circuits, and thread rejections. Statistics are gathered for all of these and reported to a [Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) for monitoring in real-time.

The Steeltoe Hystrix framework supports the following .NET application types:

 * ASP.NET - MVC, WebForm, WebAPI, WCF
 * ASP.NET Core
 * Console apps (.NET Framework and .NET Core)
 

 The source code for the Hystrix framework can be found [here](https://github.com/SteeltoeOSS/CircuitBreaker).

#### 1.1 Quick Start

This quick start makes use of two ASP.NET Core applications to illustrate how to use the Steeltoe Hystrix framework and the Hystrix Dashboard. Each application also uses the Steeltoe Discovery client to register and fetch services from an Eureka Server running locally on your development machine. 

Later on, after you have successfully run the applications locally, the quick start also walks you through how to take that same set of applications and push them to Cloud Foundry and make use of a Eureka Server and Hystrix Dashboard operating there. 

The application consists of two components; a Fortune-Teller-Service which registers a FortuneService in a running Eureka Server and a Fortune-Teller-UI which discovers the service and uses a Hystrix command to fetch fortunes from it. The Fortune-Teller-UI has also been configured to gather metrics about the command execution and report those metrics to a Hystrix Dashboard.

##### 1.1.1  Start Eureka Server Locally

In this step, we will fetch a repository from which we can start up a Netflix Eureka Server locally on our desktop. This server has been pre-configured to listen for service registrations and discovery requests at  http://localhost:8761/eureka .


```
> git clone https://github.com/spring-cloud-samples/eureka.git
> cd eureka
> mvnw spring-boot:run
```

##### 1.1.2  Start Hystrix Dashboard Locally

In this step, we will fetch a repository from which we can start up a Netflix Hystrix Dashboard locally on our desktop. This dashboard has been setup to listen for requests at http://localhost:7979/.  We will use it latter in the Quick start.


```
> git clone (https://github.com/spring-cloud-samples/hystrix-dashboard.git
> cd hystrix-dashboard
> mvnw spring-boot:run
```

##### 1.1.3 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
```

##### 1.1.4 Run Fortune-Teller-Service
Use the dotnet CLI to run the application. Note below we show how to run the app on both frameworks the sample supports. Just pick one in order to proceed.

```
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-Service
> dotnet restore --configfile nuget.config
>
> # Run on .NET Core 
> dotnet run -f netcoreapp1.1  --server.urls http://*:5000
>
> # Run on .NET Framework on Windows
> dotnet run -f net46  --server.urls http://*:5000
```

##### 1.1.5 Observe Logs
When you start the Fortune-Teller-Service, you should see something like the following:

```
> dotnet run -f netcoreapp1.1 --server.urls http://*:5000
info: Microsoft.Data.Entity.Storage.Internal.InMemoryStore[1]
      Saved 50 entities to in-memory store.
Hosting environment: Production
Now listening on: http://*:5000
Application started. Press Ctrl+C to shut down.
```

At this point the Fortune-Teller-Service is up and running and ready for the Fortune-Teller-UI to ask for fortunes.

##### 1.1.6 Run Fortune-Teller-UI
Use the dotnet CLI to run the application. Note below we show how to run the app on both frameworks the sample supports. Just pick one in order to proceed.

```
> # Set BUILD environment variable
> SET BUILD=LOCAL or export BUILD=LOCAL
>
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-UI
> dotnet restore --configfile nuget.config
>
>  # Run on .NET Core 
> dotnet run -f netcoreapp1.1  --server.urls http://*:5555
>
>  # Run on .NET Framework on Windows
> dotnet run -f net46  --server.urls http://*:5555
```

##### 1.1.7 Observe Logs
When you startup the Fortune-Teller-UI, you should see something like the following:

```
> dotnet run -f netcoreapp1.1 --server.urls http://*:5555
Hosting environment: Production
Now listening on: http://*:5555
Application started. Press Ctrl+C to shut down.
```

##### 1.1.8 What to expect

Fire up a browser and hit http://localhost:5555.  You should see your fortune displayed. Refresh the browser to see a new fortune.

##### 1.1.9 Using Hystrix Dashboard

Fire up a browser and hit http://localhost:7979.  You should see the Hystrix Dashboard displayed. Configure the dashboard to view the Hystrix metrics captured from the Fortune-Teller-UI using the following steps:

1. In the first field on the dashboard, enter: `http://localhost:5555/hystrix/hystrix.stream`. 
This is the endpoint in the Fortune-Teller-UI that the Steeltoe Hystrix framework is using to expose the Hystrix metrics.
2. Click the monitor button on the dashboard to configure it.
3. Go back to the Fortune-Teller-UI application and obtain several fortunes.  Observe the values changing in the Hystrix dashboard as you obtain fortunes.  Click the refresh button on the UI app quickly to see the dashboard update.


##### 1.1.10 Start Eureka Server Cloud Foundry

Starting with this step, we will begin to setup the applications to run on Cloud Foundry. First, we use the Cloud Foundry CLI to create a service instance of the Spring Cloud Eureka Server on Cloud Foundry.

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

##### 1.1.11 Start Hystrix Dashboard Cloud Foundry

Next we use the Cloud Foundry CLI to create a service instance of the Spring Cloud Hystrix Dashboard on Cloud Foundry.

```
# Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
# Create a Hystrix Dashboard instance on Cloud Foundry
> cf create-service p-circuit-breaker-dashboard standard myHystrixService 
>
# Wait for the service to become ready
> cf services 
```

##### 1.1.12 Publish Fortune-Teller-Service 
Use the `dotnet` CLI to build and publish the Fortune-Teller-Service to the folder `publish`. 

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-Service
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
>
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64 
>
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net46 -r win10-x64  
```

##### 1.1.13 Push Fortune-Teller-Service 

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

##### 1.1.14 Publish Fortune-Teller-UI

Use the `dotnet` CLI to build and publish the Fortune-Teller-UI to the folder `publish`. 

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

Note: Make sure the `BUILD` environment variable you set earlier is no longer set to `LOCAL`.

```
> # Remove previously set BUILD environment variable
> SET BUILD= or unset BUILD
>
> cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-UI
> 
> # Restore packages
> dotnet restore --configfile nuget.config
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
>
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64
>  
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net46 -r win10-x64  
```

##### 1.1.15 Push Fortune-Teller-UI 

Use the Cloud Foundry CLI to push the published Fortune-Teller-UI to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish  
>  
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the Fortune-Teller-UI to `myDiscoveryService` and `myHystrixService` created above.

##### 1.1.16 Observe Logs

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

##### 1.1.17 What to expect

Fire up a browser and hit http://fortuneui.x.y.z/ where `x.y.z` corresponds to the Cloud Foundry application domain that you are operating under.  

You should see your fortune displayed. Refresh the browser to see a new fortune.

##### 1.1.18 Using the Hystrix Dashboard

Open a browser and connect to the Pivotal Apps Manager. You will have to use a link that is specific to your Cloud Foundry setup. (e.g. https://apps.system.testcloud.com/)

Follow [these instructions](http://docs.pivotal.io/spring-cloud-services/1-3/common/circuit-breaker/using-the-dashboard.html) to open the Hystrix dashboard service on Cloud Foundry.

Go back to the Fortune-Teller-UI application and obtain several fortunes.  Observe the values changing in the Hystrix dashboard.  Click the refresh button on the UI app quickly to see the dashboard update.

##### 1.1.19 Understand Sample

To understand the changes needed to utilize the Steeltoe Hystrix framework you should have a look at the Fortune-Teller-Ui application. 
 
Fortune-Teller-UI was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ).  

To gain an understanding of the Steeltoe Hystrix related changes to the generated template code, examine the following files:

 * `Fortune-Teller-UI.csproj`- Contains `PackageReference` for Steeltoe Hystrix NuGet `Steeltoe.CircuitBreaker.Hystrix`. It also contains references to `S.CB.Hystrix.MetricsStream` when targeting Cloud Foundry or `S.CB.Hystrix.MetricsEvents` when running locally. These last two packages are optional, and are used to expose Hystrix metrics to the dashboard.
 * `Program.cs` - Code added to read the `--server.urls` command line.
 * `appsettings.json` - Contains configuration data to name the Hystrix thread pool (i.e. `FortuneServiceTPool`)  which is used by the `FortuneService` Hystrix command. This name will be visible in the dashboard.
 * `Startup.cs`- Code added to the `ConfigureServices()` method to add a Hystrix command `FortuneService` to the service container. Code was also added to expose Hystrix metrics to the dashboard by calling `AddHystrixMetricsStream()`. Next in the `Configure()` method, code was added to cause the Hystrix Metrics stream to start communicating with the Hystrix dashboard (i.e. `UseHystrixMetricsStream()`) and also, in order to have request level logging and metrics, a Hystrix request context needs to be setup in the pipeline (i.e. `UserHystrixRequestContext()`) for each incoming request. And finally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry configuration values when pushed to Cloud Foundry.
 * `FortuneService.cs` - Contains code used to fetch a fortune from the Fortune-Teller-Service.  This is the code that implements the Hystrix command which is used to retrieve fortunes.  It has `Run` and `RunFallback` methods which implement the command logic.
 * `HomeController.cs` - Uses the injected Hystrix command `FortuneService` to obtain a random fortune and return it to the browser.
 

#### 1.2 Usage
You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the Hystrix framework. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the framework.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services and the middleware used in the app. Specifically pay particular attention to the usage of the `Configure()` and `ConfigureServices()` methods. 

In addition to the information below, review the [Netflix Hystrix Wiki](https://github.com/Netflix/Hystrix/wiki). The Steeltoe Hystrix framework implementation aligns closely with the Java implementation. As such, the Wiki information is very relevant when it comes to Steeltoe.

If you plan on using the Hystrix Dashboard, you should also spend time understanding the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) information on the wiki.

In order to use the Steeltoe framework you need to do the following:

 * Add NuGet package references to your project.
 * Define Hystrix command(s).
 * Configure Hystrix Command and Thread Pool settings.
 * Add Hystrix command(s) to the container.
 * Use an Hystrix commands to invoke dependent services
 * Add and Use the Hystrix metrics stream service.


##### 1.2.1 Add NuGet References
There are three main Hystrix NuGets that you can choose from depending on your needs. 

The first, and main package that you will always need and use is the  `Steeltoe.CircuitBreaker.Hystrix` package. This package contains everything you need in order to define and use Hystrix commands in your application.

To use this in your project add the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix" Version= "1.1.0"/>
...
</ItemGroup>
```
Note: Referencing the above package also pulls in the `Steeltoe.CircuitBreaker.Hystrix.Core` package. 

If you plan on using Hystrix metrics and the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) then you should also include the `Steeltoe.CircuitBreaker.Hystrix.MetricsEvents` package.

To do this include the following `PackageReference` in your application:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix.MetricsEvents" Version= "1.1.0"/>
...
</ItemGroup>
```

Alternatively, if you will be pushing your application to Cloud Foundry and you want to use the [Spring Cloud Services Hystrix Dashboard](http://docs.pivotal.io/spring-cloud-services/1-3/common/circuit-breaker/), then you should include the `Steeltoe.CircuitBreaker.Hystrix.MetricsStream` package instead of the one above.

To do this include the following `PackageReference` in your application:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix.MetricsEvents" Version= "1.1.0"/>
...
</ItemGroup>
```
Note: For an example of how to setup a `.csproj` file to conditionally include `MetricsStream` or `MetricsEvents` depending on environment variable settings, see [Fortune-Teller-UI.csproj](https://github.com/SteeltoeOSS/Samples/blob/master/CircuitBreaker/src/AspDotNetCore/FortuneTeller/Fortune-Teller-UI/Fortune-Teller-UI.csproj)

##### 1.2.2 Define Commands

There are many ways to define a Hystrix command. The simplest looks like this:

```
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

Each command needs to inherit from `HystrixCommand` or `HystrixCommand<T>` and override and implement the inherited method `Run()`. Optionally, the command can also override and implement the inherited method  `RunFallback()`. 

Also, each command must be a member of a group.  The group is specified using the `HystrixCommandGroupKeyDefault.AsKey("HelloWorldGroup")` and provided to the constructor.

Here is the above command rewritten using the method overrides:


```
public class HelloWorldCommand : HystrixCommand<string>
{
    private string _name;
    public HelloWorldCommand(string name)
        : base(HystrixCommandGroupKeyDefault.AsKey("HelloWorldGroup"))
    {
        _name = name;
    }

    protected override string Run()
    {
        return "Hello" + _name;
    }
    protected override string RunFallback()
    {
        return "Hello" + _name + " via fallback";
    }
}

```

Note that HystrixCommands are state-ful objects and as such once a command has been executed, it can not be reused.  You will have to create another instance of it if you want to execute it again.

##### 1.2.3 Command Settings
Each Hystrix command that you define and use can be individually configured using normal .NET configuration services. Everything from thread-pool sizes and command time-outs to circuit-breaker thresholds can be specified.
 
For each Hystrix setting that can be made, there are four levels of precedence that are followed and applied:

1. `Fixed global command settings` - these are defaults for all Hystrix commands. These settings will be used if nothing else is specified.
2. `Configured global command settings` - these are defaults specified in configuration files that override the fixed values above and apply to all Hystrix commands.
3. `Command settings specified in code` - these are settings you specify in the constructor of your Hystrix command. These settings will apply to that specific instance.
4. `Configured command specific settings` - these are settings specified in configuration files that are targeted at named commands and will apply to all instances created with that name.

All configured Hystrix settings should be placed under the prefix with the key `hystrix:command:`.  

All configured global settings, as described in #2 above, should be placed under the prefix `hystrix:command:default:`. Here is an example which configures the default timeout for all commands to be 750 milliseconds: `hystrix:command:default:execution:isolation:thread:timeoutInMilliseconds=750`

If you wish to configure the settings for a command in code, you will have to make use of the [`HystrixCommandOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.Hystrix.Core/HystrixCommandOptions.cs) type found in the `Steeltoe.CircuitBreaker.Hystrix.Core` package. More information on how to use this type and configure command settings in will follow in later sections.

All configured command specific settings, as described in #4 above, should be placed under the prefix `hystrix:command:HYSTRIX_COMMAND_KEY:`, where `HYSTRIX_COMMAND_KEY` is the "name" of the command. Here is an example which configures the timeout for the Hystrix command with the "name"=foobar to be 750 milliseconds:
`hystrix:command:foobar:execution:isolation:thread:timeoutInMilliseconds=750`

The following set of tables specify all of the possible settings by category.  

Note that the settings provided below follow closely those implemented by the Java Hystrix implementation. As a result, to obtain a further understanding of each setting and how it affects Hystrix command operations, you are encouraged to read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki.

###### 1.2.3.1 Execution

These settings control how the HystrixCommand's `Run()` method will be executed.  Each setting is prefixed with the key `execution`.

|Key|Description|
|------|------|
|**execution:timeout:enabled**|enable or disable `Run()` timeouts, defaults = true|
|**execution:isolation:strategy**|THREAD or SEMAPHORE, defaults = THREAD|
|**execution:isolation:thread:timeoutInMilliseconds**|time allowed for `Run()` execution completion, then fallback is executed, defaults = 1000|
|**execution:isolation:semaphore:maxConcurrentRequests**|maximum requests to `Run()` method when using SEMAPHORE strategy, defaults = 10|

Example: `hystrix:command:foobar:execution:isolation:strategy=SEMAPHORE`

###### 1.2.3.2 Fallback

These settings control how the HystrixCommand's `RunFallback()` method will be executed.  Each setting is prefixed with the key `fallback`.

|Key|Description|
|------|------|
|**fallback:enabled**|enable or disable `RunFallback()`, defaults = true|
|**fallback:isolation:semaphore:maxConcurrentRequests**|maximum requests to `RunFallback()` method when using SEMAPHORE strategy, defaults = 10|

Example: `hystrix:command:foobar:fallback:enabled=false`

###### 1.2.3.3 Circuit Breaker 

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

###### 1.2.3.4 Metrics

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

###### 1.2.3.5 Request Cache

These settings control whether Hystrix command request caching is enabled or disabled. Each setting is prefixed with the key `requestCache`.

|Key|Description|
|------|------|
|**requestCache:enabled**|enable or disable request scoped caching, defaults = true|

###### 1.2.3.6 Request Logging

These settings control whether Hystrix command execution events are logged to the Request log. Each setting is prefixed with the key `requestLog`.

|Key|Description|
|------|------|
|**requestLog:enabled**|enable or disable request scoped logging, defaults = true|

Example: `hystrix:command:foobar:fallback:enabled=false`

###### 1.2.3.7 Thread Pool 

These settings control what and how the command uses the Hystrix thread pools. 

|Key|Description|
|------|------|
|**threadPoolKeyOverride**|set the thread pool used by the command, defaults = command group key name|

Example: `hystrix:command:foobar:threadPoolKeyOverride=FortuneServiceTPool`

##### 1.2.4 Thread Pool Settings

In addition to configuring the settings for Hystrix commands, you can also configure the settings Steeltoe Hystrix will use in creating and managing its thread pools.

In most cases, you will be able to take the defaults and not have to configure these settings. 

Just like for Hystrix command settings, there are four levels of precedence that are followed and applied:

1. `Fixed global pool settings` - these are defaults for all Hystrix pools. These settings will be used if nothing else is specified.
2. `Configured global pool settings` - these are defaults specified in configuration files that override the fixed values above and apply to all Hystrix pools.
3. `Pool settings specified in code` - these are settings you specify in the constructor of your Hystrix thread pool. These settings will apply to all commands that are created that reference that pool.
4. `Configured pool specific settings` - these are settings specified in configuration files that are targeted at named thread pools and  will apply to all commands that are created that reference that pool.

All configured Hystrix settings should be placed under the prefix with the key `hystrix:threadpool:`.  

All configured global settings, as described in #2 above, should be placed under the prefix `hystrix:threadpool:default:`. Here is an example which configures the default number of threads in all thread pools to be 20: `hystrix:threadpool:default:coreSize=20`

If you wish to configure the settings for a thread pool in code, you will have to make use of the [`HystrixThreadPoolOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.Hystrix.Core/HystrixThreadPoolOptions.cs) type found in the `Steeltoe.CircuitBreaker.Hystrix.Core` package. More information on how to use this type and configure thread pool settings will follow in later sections.

All configured pool specific settings, as described in #4 above, should be placed under the prefix `hystrix:threadpool:HYSTRIX_THREADPOOL_KEY:`, where `HYSTRIX_THREADPOOL_KEY` is the "name" of the thread pool. Here is an example which configures the number of threads for the Hystrix thread pool with the "name"=foobar to be 40:
`hystrix:threadpool:foobar:coreSize=40`

The following tables specify all of the possible settings.  

Note that the settings provided below follow closely those implemented by the Java Hystrix implementation. As a result, to obtain a further understanding of each setting and how it affects Hystrix thread pool operations, you are encouraged to read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki.

###### 1.2.4.1 Sizing

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

###### 1.2.4.2 Metrics

These settings control the behavior of capturing metrics from Hystrix thread pools.  Each setting is prefixed with the key `metrics`.

|Key|Description|
|------|------|
|**rollingStats.timeInMilliseconds**|duration of the statistical rolling window, defines how long metrics are kept for the thread pool, default = 10000|
|**rollingStats.numBuckets**|number of buckets the rolling statistical window is divided into, default = 10|

Example: `hystrix:threadpool:foobar:metrics:rollingStats:timeInMilliseconds=20000`

##### 1.2.5 Configure Settings

The most convenient way to configure settings for Hystrix is to put them in a file and then use one of the file based .NET configuration providers to read them in.

Below is an example of some Hystrix settings in JSON which configure the `FortuneService` command to use a thread pool with the name `FortuneServiceTPool`.  


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

If you wanted to managed the settings centrally, you can use the Spring Cloud Config Server (i.e. `AddConfigServer()`), instead of a local JSON file (i.e. `AddJsonFile()`). Simply by putting the setting above in a github repository and configuring the Config server to serve its configuration data from that repository.

##### 1.2.6 Add Commands

Once you have read in your configuration data, then you are at a point that you can add the Hystrix commands to the service container making them available for injection in your application.  There are several Steeltoe extension methods you can use to help you accomplish this.

Note that you do NOT need to add your commands to the container. Instead, you are free to just `new` them in code at any point in time in your application and make use of them.

But, if you do want to have them injected, then you can do this in the `ConfigureServices()` method of the `Startup` class. Simply make use of the `AddHystrixCommand()` extension methods provided by the Steeltoe package.  Here is an example:


```
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
        ...
    }

    ....
```

There is one requirement you must follow if you wish to use the `AddHystrixCommand()` extension methods. When you define your HystrixCommand, you need to make sure you define a public constructor for your command in which the first argument is a `IHystrixCommandOptions`. (i.e. `HystrixCommandOptions`).  You don't need to create or populate the contents `IHystrixCommandOptions`; instead the extension method will do that for you by using the configuration data you provide in the method call.

Here is an example illustrating how to define a compatible constructor.  Notice that `FortuneService` inherits from `HystrixCommand<string`, so thereby its a command which returns results of type `string`.  Notice the constructor has as a first argument `IHystrixCommandOptions` and also note you can add additional constructor arguments.

```
public class FortuneService : HystrixCommand<string>, IFortuneService
{
    DiscoveryHttpClientHandler _handler;
    public FortuneService(IHystrixCommandOptions options, IDiscoveryClient client) : base(options)
    {
         _handler = new DiscoveryHttpClientHandler(client);
    }
}
```

##### 1.2.7 Use Commands

If you have used the `AddHystrixCommand()` extension methods described earlier, then all you need to do to get an instance of the command in your controllers or views is to add the command as an argument in the constructor. Here is an example controller that makes use of a Hystrix command `IFortuneService` which was added to the container using `AddHystrixCommand<IFortuneService, FortuneService>("FortuneService", Configuration)`.  The controller uses the `RandomFortuneAsync()` method on the injected command to retrieve a fortune.

```
public class HomeController : Controller
{
    IFortuneService _fortunes;
    public HomeController(IFortuneService fortunes)
    {
        _fortunes = fortunes;
    }

    [HttpGet("random")]
    public async Task<string> Random()
    {
        return await _fortunes.RandomFortuneAsync();
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    }
}
```

Below is the definition of the Hystrix command used above. As you can see, the `FortuneService` class is a Hystrix command and is intended to be used in retrieving Fortunes from a Fortune micro-service. The micro-service will have been registered under the name `fortuneService` and the command makes use of the Steeltoe Eureka client for service lookup.

```
using Pivotal.Discovery.Client;
using Steeltoe.CircuitBreaker.Hystrix;

public class FortuneService : HystrixCommand<string>, IFortuneService
{
    DiscoveryHttpClientHandler _handler;
    private const string RANDOM_FORTUNE_URL = "https://fortuneService/api/fortunes/random";

    public FortuneService(IHystrixCommandOptions options, IDiscoveryClient client) : base(options)
    {
        _handler = new DiscoveryHttpClientHandler(client);
        IsFallbackUserDefined = true;
    }

    public async Task<string> RandomFortuneAsync()
    {
        var result = await ExecuteAsync();
        return result;
    }

    protected override string Run()
    {
        var client = GetHttpClient();
        var result =  client.GetStringAsync(RANDOM_FORTUNE_URL).Result;
        return result;
    }

    protected override string RunFallback()
    {
        return "{\"id\":1,\"text\":\"You will have a happy day!\"}";
    }

    private HttpClient GetHttpClient()
    {
        var client = new HttpClient(_handler, false);
        return client;
    }
}
```

First, notice that the `FortuneService` constructor takes a `IHystrixCommandOptions` as a parameter. This is the configuration used by the command and has been populated with configuration data read during `Startup`. 

Second, notice the two protected methods `Run()` and `RunFallback()`. These are the worker methods for the command and ultimately does the work the Hystrix command is intended to do. The `Run()` method uses a `HttpClient` to make a REST request of the Fortune micro-service returning the result as a string.  The `RunFallback()` method just returns a hard coded fortune. 
The controller code simply invokes the async method `RandomFortuneAsync()` to start command execution. 

You have multiple ways in which you can cause commands to execute and obtain its result. 

To execute a command synchronously you can make use of the commands `Execute()` method,

```
var command = new FortuneService(....);
string result = command.Execute();
```

To execute a command asynchronously, you should use the `ExecuteAsync()` method,

```
var command = new FortuneService(....);
string result = await command.ExecuteAsync();
```

You can also use Rx.NET extensions and observe the results of a command by using the `Observe()` method.  The `Observe()` method returns a `hot` observable which has already started command execution.

```
var command = new FortuneService(....);
IObservable<string> observable = command.Observe();
string result = await observable.FirstOrDefaultAsync();
```

Alternatively, you can use the `ToObservable()` method to return a `cold` observable of the command.  When you `Subscribe()` to it, the underlying command will begin execution at that point and the results will be made available in the Observers `OnNext(result)` method.

```
var command = new FortuneService(....);
IObservable<string> cold = command.ToObservable();
IDisposable subscription = cold.Subscribe( (result) => { Console.WriteLine(result); });
```
 
##### 1.2.8 Use Metrics
As HystrixCommands execute, they generate metrics on execution outcomes, latency and thread pool usage. This information can be very useful in monitoring and managing your applications. The Hystrix Dashboard allows you to extract and view these metrics in real time.  With Steeltoe, there are currently two dashboards you can choose from. 

The first is the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard). This dashboard is appropriate when you are not using or running your application on Cloud Foundry.  For example, when you are developing and testing your application locally on your desktop.

The second is the [Spring Cloud Services Hystrix Dashboard](http://docs.pivotal.io/spring-cloud-services/1-3/common/circuit-breaker/).  This dashboard is part of the [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-3/common/) tile and is made available to applications via the normal service instance binding mechanisms on Cloud Foundry.

Note, as described in the *Add NuGet References* section above, depending on which dashboard you are targeting, you will need to make sure you include the right Steeltoe NuGet into your project. 

The `Steeltoe.CircuitBreaker.Hystrix.MetricsEvents` package should be used when targeting the Netflix Hystrix Dashboard. When added to your app, it exposes a new REST endpoint in your application: `/hystrix/hystrix.stream`. This endpoint is used by the dashboard in receiving `SSE` metrics events from your application.

The `Steeltoe.CircuitBreaker.Hystrix.MetricsStream` package should be used when targeting the Spring Cloud Services Hystrix Dashboard. When added to your app, it starts up a background thread and uses messaging to push the metrics to the dashboard.

In order to enable your application to emit metrics using either of these two mechanisms you will have to make three changes to your `Startup` class.

* Add Hystrix Metrics stream service to container
* Use Hystrix Request context middleware in pipeline
* Start Hystrix Metrics stream

To add the metrics stream to the service container, in the `ConfigureService()` method in your `Startup` class, you will need to  use the `AddHystrixMetricsStream()` extension method.

```
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

Once this is done, then you will need to configure a couple Hystrix related items in the request processing pipeline in `Configure()` of the `Startup` class.  First, metrics requires Hystrix Request contexts to be initialized and available to operate. You can enable this by using the Steeltoe extension method `UseHystrixRequestContext()` as shown below. Additionally, to startup the metrics stream service, you need to call the `UseHystrixMetricsStream()` extension method. 

```
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

###### 1.2.8.1 Netflix Dashboard
Once you have made the changes described above, you can make use of the Netflix Hystrix Dashboard by following the instructions below. 

1. Clone the Hystrix dashboard. (https://github.com/spring-cloud-samples/hystrix-dashboard.git)
2. Go to the cloned directory (`hystix-dashboard`) and fire it up with `mvn spring-boot:run`.
3. Open a browser and connect to the dashboard. (e.g. http://localhost:7979)
4. In the first field, enter the endpoint in the application that is exposing the hystrix metrics. (e.g. http://localhost:5555/hystrix/hystrix.stream).
5. Click the monitor button.
6. Use your application and see the metrics begin to flow in.

###### 1.2.8.2 Cloud Foundry Dashboard

When you want to use a Hystrix Dashboard on Cloud Foundry and you have installed Spring Cloud Services, you can create and bind a instance of it to the application using the Cloud Foundry CLI as follows:

```
> cf target -o myorg -s development
> # Create Hystrix dashboard instance named `myHystrixService`
> cf create-service p-circuit-breaker-dashboard standard myHystrixService 
> # Wait for service to become ready
> cf services 
```

For more information on using the Hystrix Dashboard on Cloud Foundry, see the [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-3/common/) documentation.

Once you have bound the service to the application, the Hystrix Dashboard settings will become available and be setup in `VCAP_SERVICES`.

In order for the settings to be picked up and put in the configuration, you have to make use of the Cloud Foundry configuration provider.  

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

Then when you push the application to Cloud Foundry, the Hystrix Dashboard settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`). 

If there are any merge conflicts, then the service binding settings will take precedence and will override all others. 

Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

Once you have performed the steps described above, and you have made the changes described in *Use Metrics* section above, you can make use of the Spring Cloud Services Hystrix Dashboard by following the instructions below:

1. Open a browser and connect to the Pivotal Apps Manager.  
2. Follow [these instructions](http://docs.pivotal.io/spring-cloud-services/1-3/common/circuit-breaker/using-the-dashboard.html) to open the Hystrix Dashboard service.
3. Use your application and see the metrics begin to flow in.