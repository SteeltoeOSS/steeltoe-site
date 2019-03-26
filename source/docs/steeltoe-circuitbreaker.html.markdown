---
title: Circuit Breaker
order: 60
date: 2016/4/1
tags:
---

The Steeltoe Circuit Breaker framework provides applications with an implementation of the Circuit Breaker pattern. Cloud-native architectures  typically consist of multiple layers of distributed services. End-user requests may require multiple calls to these services, and failures in lower-level services can spread to other dependent services and cascade up to the end user. Heavy traffic to a failing service can also make it difficult to repair. By using Circuit Breaker frameworks, you can prevent failures from cascading and provide fallback behavior until a failing service is restored to normal operation.

![cb](/images/circuit-breaker-overview.png)

When applied to a service, a circuit breaker watches for failing calls to the service. If failures reach a certain threshold, it “opens” (or breaks) the circuit and automatically redirects calls to the specified fallback mechanism. This gives the failing service time to recover.

There are several options to choose from when implementing the Circuit Breaker pattern. Steeltoe has initially chosen to support one based on Hystrix, Netflix's Latency and Fault Tolerance library for distributed systems. For more information about Hystrix, see the [Netflix/Hystrix Wiki](https://github.com/Netflix/Hystrix/wiki) and the [Spring Cloud Netflix](https://projects.spring.io/spring-cloud/) documentation.

>NOTE: Depending on your hosting environment, service instances you create for the purpose of exploring the Quick Starts on this page may have a cost associated.

# 0.0 Initialize Dev Environment

All of the Steeltoe sample applications are in the same repository. If you have not already done so, use Git to clone the repository, as follows:

```bash
git clone https://github.com/SteeltoeOSS/Samples.git
```

Alternatively, you can download it with your browser from GitHub at [Steeltoe Samples](https://github.com/SteeltoeOSS/Samples).

>NOTE: all Circuit Breaker samples in the Samples repository have a base path of `Samples/CircuitBreaker/src/`.

Make sure your Cloud Foundry CLI tools are logged in and targeting the correct org and space, as follows:

```bash
cf login [-a API_URL] [-u USERNAME] [-p PASSWORD] [-o ORG] [-s SPACE] [--skip-ssl-validation]
# or
cf target -o <YourOrg> -s <YourSpace>
```

The CircuitBreaker sample requires a Eureka server and a Hystrix dashboard. We cover how to run those later. If you intend to run the samples locally, install the [Java 8 JDK](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and [Maven 3.x](https://maven.apache.org/download.cgi) now.

# 1.0 Netflix Hystrix

Steeltoe's Hystrix implementation lets application developers isolate and manage back-end dependencies so that a single failing dependency does not take down the entire application. This is accomplished by wrapping all calls to external dependencies in a `HystrixCommand`, which runs in its own separate external thread.

Hystrix maintains its own small fixed-size thread pool from which commands are executed. When the pool becomes exhausted, Hystrix commands are immediately rejected, and, if provided, a fallback mechanism is executed. This prevents any single dependency from using up all of the threads for failing external dependencies.

Each Hystrix command also has the ability to create a timeout for any calls that take longer than the configured threshold. If a timeout occurs, the command automatically executes a fallback mechanism (if the developer provided one). Developers can configure each command with custom fallback logic that runs when a command fails, is rejected, times out, or trips the circuit breaker.

Each command has a built-in configurable circuit breaker that stops all requests to failing back-end dependencies when the error percentage passes a threshold. The circuit remains open (broken) for a configurable period of time, and all requests are then sent to the fallback mechanism until the circuit is closed (connected) again.

Hystrix also provides a means to measure command successes, failures, timeouts, short-circuits, and thread rejections. Statistics are gathered for all of these and can optionally be reported to a [Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) for monitoring in real-time.

The remaining sections of this chapter describe these features. Also, you should understand that Steeltoe's Hystrix implementation follows the Netflix implementation closely. As a result, its worthwhile to review the [Netflix documentation](https://github.com/Netflix/Hystrix/wiki) in addition to this documentation.  Pay particular attention to the [How it Works](https://github.com/Netflix/Hystrix/wiki/How-it-Works) section as it provides a [Flow Chart](https://github.com/Netflix/Hystrix/wiki/How-it-Works#Flow) explaining how a command executes and how the default [Circuit Breaker](https://github.com/Netflix/Hystrix/wiki/How-it-Works#CircuitBreaker) transitions between CLOSED, OPEN and HALF-OPEN states.  It also provides details on how the [Bulkhead pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/bulkhead) is implemented using isolation techniques employing [Threads and Thread Pools](https://github.com/Netflix/Hystrix/wiki/How-it-Works#isolation).

The Steeltoe Hystrix framework supports the following .NET application types:

* ASP.NET (MVC, WebForm, WebAPI, WCF)
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

The source code for the Steeltoe Circuit Breaker libraries can be found [here](https://github.com/SteeltoeOSS/CircuitBreaker).

## 1.1 Quick Start

This quick start uses two ASP.NET Core applications, the Steeltoe Hystrix framework and the Hystrix Dashboard. In addition to using Hystrix, each application also uses the Steeltoe Discovery client to register and fetch services from a Eureka Server running locally on your development machine.

Later on in the quick start, after you have successfully run the applications locally, the quick start also walks you through taking that same set of applications, pushing them to Cloud Foundry, and making use of a Eureka Server and a Hystrix Dashboard operating there.

The application consists of two components:

* Fortune-Teller-Service, which registers a FortuneService in a Eureka Server.
* Fortune-Teller-UI, which discovers the service and uses a Hystrix command to fetch Fortunes from it.

The Fortune-Teller-UI has also been configured to gather metrics about command executions and to report those metrics to a Hystrix Dashboard.

### 1.1.1 Running Locally

To run Fortune Teller locally, you must do the following:

* [Start a Eureka Server](#1-1-1-1-start-a-eureka-server)
* [Start a Hystrix Dashboard](#1-1-1-2-start-a-hystrix-dashboard)
* [Run Fortune Teller](#1-1-1-3-run-fortune-teller)
* [Observe Logs](#1-1-1-4-observe-logs)
* [View Fortunes](#1-1-1-5-view-fortunes)
* [Use a Hystrix Dashboard](#1-1-1-6-use-a-hystrix-dashboard)

#### 1.1.1.1 Start a Eureka Server

To run a Netflix Eureka Server locally, you must fetch the Spring Cloud Eureka sample repository. This server has been pre-configured to listen for service registrations and discovery requests at  <http://localhost:8761/eureka>.

To fetch the repository, run the following `git` command:

```bash
git clone https://github.com/spring-cloud-samples/eureka.git
```

You can the start the Eureka server by running the following commands:

```bash
cd eureka
./mvnw spring-boot:run
```

#### 1.1.1.2  Start a Hystrix Dashboard

To run a Netflix Hystrix Dashboard locally on our desktop, you must fetch the Spring Cloud Hystrix Dashboard sample repository. This dashboard has been setup to listen for requests at <http://localhost:7979/>.  We use it later on in the Quick start.

To fetch the repository that contains our Hystrix dashboard, run the following command:
[//]: # (If the reader has followed directions, their current directory is the eureka directory. Should this command be run there or should we tell them to cd to the top of their working directory tree?)

```bash
git clone https://github.com/spring-cloud-samples/hystrix-dashboard.git
```

To start the Hystrix dashboard, run the following commands:

```bash
mvn install
java -jar target/hystrix-dashboard-0.0.1.BUILD-SNAPSHOT.jar
```

#### 1.1.1.3 Run Fortune Teller

We recommend running this application is with the dotnet CLI. We have provided scripts to start both the service and the UI. To use the scripts, run the following commands:

```bash
# Make sure you're in the correct directory
cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller

# Use the helper scripts, passing in either net461 or netcoreapp2.1
.\RunFortuneTeller net461
```

You can also run the commands directly yourself, by running the following commands:

```bash
# Run the service in one window:
cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-Service
dotnet run -f netcoreapp2.1 --force

# And the UI in another:
cd Samples/CircuitBreaker/src/AspDotNetCore/Fortune-Teller/Fortune-Teller-UI
# Use one of these commands to set BUILD environment variable to `LOCAL`:
SET BUILD=LOCAL or export BUILD=LOCAL
dotnet run -f netcoreapp2.1 --force
```

>NOTE: Fortune-Teller-UI includes different libraries based on the value of the BUILD environment variable. If it is not set correctly at build time, you may see many errors relating to RabbitMQ in the application's output.

#### 1.1.1.4 Observe Logs

The `dotnet run` command in each sample should produce output similar to the following:

```bash
info: Microsoft.Data.Entity.Storage.Internal.InMemoryStore[1]
      Saved 50 entities to in-memory store.
Hosting environment: Production
Now listening on: http://*:5000
Application started. Press Ctrl+C to shut down.
```

Once you see "Application started..." for both applications, the Fortune Teller sample is ready to go.

#### 1.1.1.5 View Fortunes

Open your favorite browser and go to <http://localhost:5555>. You should see your fortune displayed. Refresh the page for a new fortune.

To see the results of a Hystrix Collapser obtaining multiple fortunes, go to <http://localhost:5555/#/multiple>.

#### 1.1.1.6 Use a Hystrix Dashboard

To see the Hystrix Dashboard, start a browser and go to <http://localhost:7979>. Configure the dashboard to view the Hystrix metrics captured from the Fortune-Teller-UI as follows:

1. In the first field on the dashboard, enter: `http://localhost:5555/hystrix/hystrix.stream`. This is the endpoint in the Fortune-Teller-UI that the Steeltoe Hystrix framework uses to expose the Hystrix metrics.
1. Click the monitor button on the dashboard to configure it.
1. Go back to the Fortune-Teller-UI application and obtain several fortunes. Observe the values changing in the Hystrix dashboard as you obtain fortunes. Refresh the UI app several times in a row to see the dashboard update.

### 1.1.2 Running on Cloud Foundry

To run Fortune Teller on Cloud Foundry, you must do the following:

* [Start a Eureka Server](#1-1-2-1-start-a-eureka-server)
* [Start a Hystrix Dashboard](#1-1-2-2-start-a-hystrix dashboard)
* [Publish Fortune Teller Service](#1-1-2-3-publish-fortune-teller-service)
* [Push Fortune Teller Service](#1-1-2-4-push-fortune-teller-service)
* [Publish Fortune-Teller-UI](#1-1-2-5-publish-fortune-teller-ui)
* [Push Fortune-Teller-UI](#1-1-2-6-push-fortune-teller-ui)
* [Observe Logs](#1-1-2-7-observe-logs)
* [View Fortunes](#1-1-2-8-view-fortunes)
* [Use a Hystrix Dashboard](#1-1-2-9-use-a-hystrix-dashboard)

#### 1.1.2.1 Start a Eureka Server

To use the Cloud Foundry CLI to create a service instance of the Spring Cloud Eureka Server on Cloud Foundry, run the following commands:

```bash
# Create a Eureka Server instance on Cloud Foundry
cf create-service p-service-registry standard myDiscoveryService

# Wait for the service to become ready
cf services
```

#### 1.1.2.2 Start a Hystrix Dashboard

Now you can use the Cloud Foundry CLI to create a service instance of the Spring Cloud Hystrix Dashboard on Cloud Foundry by running the following commands:

```bash
# Create a Hystrix Dashboard instance on Cloud Foundry
cf create-service p-circuit-breaker-dashboard standard myHystrixService

# Wait for the service to become ready
cf services
```

#### 1.1.2.3 Publish Fortune-Teller-Service

See [Publish Sample](#publish-sample) for instructions on how to publish this sample to either Linux or Windows.

#### 1.1.2.4 Push Fortune-Teller-Service

See [Push Sample](#push-sample) for instructions on how to push this sample to either Linux or Windows on Cloud Foundry.

#### 1.1.2.5 Publish Fortune-Teller-UI

If you did not use the provided helper scripts, make sure the `BUILD` environment variable you set earlier is not set to `LOCAL` before you publish the Fortune-Teller-UI. The scripts take care of resetting this variable for you. The following command unsets a the `BUILD` variable:

```bash
# Remove previously set BUILD environment variable
SET BUILD= # or unset BUILD
```

See [Publish Sample](#publish-sample) for instructions on how to publish this sample to either Linux or Windows.

#### 1.1.2.6 Push Fortune-Teller-UI

See [Push Sample](#push-sample) for instructions on how to push this sample to either Linux or Windows on Cloud Foundry.

#### 1.1.2.7 Observe Logs

To see the logs as the application starts, run `cf logs fortuneService` or `cf logs fortuneui`.

On a Linux cell, you should see output resembling the following during startup:

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

On Windows cells, you should see something slightly different but with the same content.

#### 1.1.2.8 View Fortunes

Start a browser and visit <https://fortuneui.x.y.z>, where `x.y.z` corresponds to your Cloud Foundry application domain.

You should see your fortune. Refresh the browser to see a new fortune.

To see the results of a Hystrix Collapser obtaining multiple fortunes, visit <https://fortuneui.x.y.z/#/multiple>.

#### 1.1.2.9 Use a Hystrix Dashboard

Open a browser and go to the Pivotal Apps Manager. You must use a link that is specific to your Cloud Foundry setup (such as <https://apps.system.testcloud.com/>).

Follow [these instructions](https://docs.pivotal.io/spring-cloud-services/1-5/common/circuit-breaker/using-the-dashboard.html) to open the Hystrix dashboard on Cloud Foundry.

Now go back to the Fortune-Teller-UI application and obtain several fortunes. In the Hystrix dashboard, you should see the values changing. Click the refresh button on the UI app quickly to see the dashboard update.

### 1.1.3 Understanding the Sample

To understand the changes needed to use the Steeltoe Hystrix framework, look at the Fortune-Teller-UI application.

Fortune-Teller-UI was created by using the .NET Core tooling `mvc` template (`dotnet new mvc`) and then modified to use the Steeltoe libraries.

Steeltoe related changes to the template code can be found in the following files:

* `Fortune-Teller-UI.csproj`: Contains `PackageReference` for Steeltoe Hystrix NuGet `Steeltoe.CircuitBreaker.HystrixCore`. It also contains references to `Steeltoe.CircuitBreaker.Hystrix.MetricsStreamCore` (when targeting Cloud Foundry) or `Steeltoe.CircuitBreaker.Hystrix.MetricsEventsCore` (when running locally). These last two packages are used to expose Hystrix metrics to the dashboard.
* `appsettings.json`: Contains configuration data to name the Hystrix thread pool (`FortuneServiceTPool`), which is used by the `FortuneServiceCommand` command. This name becomes visible in the dashboard. It also contains a configuration value for the `FortuneServiceCollapser`, which is used to obtain multiple fortunes.
* `FortuneServiceCommand.cs`: This is the code that implements the Hystrix command that is used to retrieve fortunes. It has `RunAsync()` and `RunFallbackAsync()` methods that implement the commands logic.
* `FortuneServiceCollapser.cs`: This is the code that implements the Hystrix Collapser, which is used to illustrate how to use a Collapser to retrieve multiple fortunes.  It has `CreateCommand()` and `MapResponseToRequests()` methods, which implement the Collapser logic.
* `MultiFortuneServiceCommand`: This is the Hystrix Command that the Collapser uses to obtain multiple fortunes.
* `HomeController.cs`: Uses the injected Hystrix command, `FortuneServiceCommand`, to obtain fortunes and return them to the browser.
* `Startup.cs`- Multiple changes were made, as follows:
  * Code was added to the `ConfigureServices()` method to add a Hystrix Command, `FortuneServiceCommand`, to the service container.
  * Code was added to the `ConfigureServices()` method to add a Hystrix Collapser, `FortuneServiceCollapser`, to the service container.
  * Code was added to expose Hystrix metrics to the dashboard by calling `AddHystrixMetricsStream()`.
  * Code was added in the `Configure()` method to cause the Hystrix Metrics stream to start communicating with the Hystrix dashboard (`UseHystrixMetricsStream()`)
  * Code was added in the `Configure()` method to use request-level logging and metrics and to setup a Hystrix request context for each incoming request in the pipeline (`UseHystrixRequestContext()`) .
* `Program.cs`: Code was added to the `ConfigurationBuilder` to pick up Cloud Foundry configuration values when pushed to Cloud Foundry and to use Cloud Foundry hosting.

## 1.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the Hystrix framework. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the framework.

You should also have a good understanding of how the [ASP.NET Core Startup class](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) is used in configuring the application services and the middleware used in the app. You should pay particular attention to the usage of the `Configure()` and `ConfigureServices()` methods.

In addition to the information below, review the [Netflix Hystrix Wiki](https://github.com/Netflix/Hystrix/wiki). The Steeltoe Hystrix framework implementation aligns closely with the Netflix implementation. Consequently, the Wiki information applies directly to Steeltoe.

If you plan to use the Hystrix Dashboard, you should also spend time understanding the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) information on the wiki.

To use the Steeltoe framework:

* Add Hystrix NuGet package references to your project
* Define Hystrix Command(s) and/or Hystrix Collapser(s)
* Configure Hystrix settings
* Add Hystrix Command(s) and/or Collapser(s) to the container
* Use Hystrix Command(s) and/or Collapser(s) to invoke dependent services
* Add and Use the Hystrix metrics stream service

>NOTE: Most of the code in the following sections is based on using Hystrix in an ASP.NET Core application. If you are developing an ASP.NET 4.x application or a Console based app, see the [other samples](https://github.com/SteeltoeOSS/Samples/tree/master/CircuitBreaker) for example code you can use.

### 1.2.1 Add NuGet References

There are two types of NuGet references to consider with when adding Hystrix to your application.

The first is required to bring the basic Hystrix functionality (the ability to define and execute commands) into your application. Choose from the following based on the type of the application you are building and what Dependency Injector you have chosen, if any.

|App Type|Package|Description|
|---|---|---|
|Console/ASP.NET 4.x|`Steeltoe.CircuitBreaker.HystrixBase`|Base functionality, no DI|
|ASP.NET Core|`Steeltoe.CircuitBreaker.HystrixCore`|Includes base, adds ASP.NET Core DI|
|ASP.NET 4.x with Autofac|`Steeltoe.CircuitBreaker.HystrixAutofac`|Includes base, adds Autofac DI|

To add this type of NuGet to your project add something like the following `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CircuitBreaker.HystrixCore" Version= "2.1.0"/>
...
</ItemGroup>
```

The second type of NuGet that you need to consider pertains to Hystrix metrics. If you are developing an ASP.NET Core application and plan on using Hystrix metrics and the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard) then you need to also include the `Steeltoe.CircuitBreaker.Hystrix.MetricsEventsCore` package in your application.

To do this include the following `PackageReference` in your application:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix.MetricsEventsCore" Version= "2.1.0"/>
...
</ItemGroup>
```

Alternatively, if you will be pushing your application to Cloud Foundry and you want to use the [Spring Cloud Services Hystrix Dashboard](https://docs.pivotal.io/spring-cloud-services/1-5/common/circuit-breaker/), then include one of the following packages instead.

|App Type|Package|Description|
|---|---|---|
|ASP.NET Core|`Steeltoe.CircuitBreaker.Hystrix.MetricsStreamCore`|ASP.NET Core DI|
|ASP.NET 4.x with Autofac|`Steeltoe.CircuitBreaker.Hystrix.MetricsStreamAutofac`|Autofac DI|

In addition to one of the above package references, you also need to include a package reference to a RabbitMQ client.

To add this type of NuGet to your project add something like the following:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CircuitBreaker.Hystrix.MetricsStreamCore" Version= "2.1.0"/>
    <PackageReference Include="RabbitMQ.Client" Version="5.0.1" />
...
</ItemGroup>
```

### 1.2.2 Define Commands

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

Each command needs to inherit from `HystrixCommand` or `HystrixCommand<T>` and override and implement the inherited and protected `RunAsync()` method. Optionally, you can also override and implement the inherited method `RunFallbackAsync()` method.

The `RunAsync()` method should implement the fundamental logic of the command, and the `RunFallbackAsync()` method should implement any fallback logic, in case the `RunAsync()` method fails.

Each command must be a member of a group. The name of the group is specified by using the `HystrixCommandGroupKeyDefault.AsKey("YourGroupName")` method and must be provided in the constructor of the command.

The following example shows the same command shown earlier rewritten by using method overrides:

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

It's important to understand that `HystrixCommands` are stateful objects. Once they have been run, they can no longer be reused. If you want to execute a command again, you must create another instance (for example, `new MyCommand()`) and call one of the execute methods again.

### 1.2.3 Command Settings

Each Hystrix command that you define can be individually configured by using normal .NET configuration services. You can specify everything from thread pool sizes and command time-outs to circuit-breaker thresholds.

For each of the possible Hystrix settings, there are four levels of precedence that are followed and applied by the framework:

1. `Fixed global command settings`: The defaults for all Hystrix commands. Used if nothing else is specified.
1. `Configured global command settings`: Settings in application configuration. Overrides fixed global settings for all Hystrix commands.
1. `Command settings specified in code`: Specified in the constructor of your Hystrix command. Applies to that specific instance.
1. `Configured command specific settings`: Specified in application configuration for named commands. Applies to all instances created with that name.

All Hystrix command settings should be prefixed with `hystrix:command:`.

`Configured global command settings` should be prefixed with `hystrix:command:default:`. The following example configures the default timeout for all commands to be 750 milliseconds:

`hystrix:command:default:execution:isolation:thread:timeoutInMilliseconds=750`

To configure the settings for a command in code, use [`HystrixCommandOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.HystrixBase/HystrixCommandOptions.cs) from the `Steeltoe.CircuitBreaker.HystrixBase` package. More information on how to use this type can be found under[Add Commands](#1-2-7-add-commands) and [Use Commands](#1-2-8-use-commands).

All configured command-specific settings, as described earlier in #4, should be prefixed with `hystrix:command:HYSTRIX_COMMAND_KEY:`, where `HYSTRIX_COMMAND_KEY` is the `name` of the command. The following example configures the timeout for the Hystrix command with a name of `sample` to be 750 milliseconds:

`hystrix:command:sample:execution:isolation:thread:timeoutInMilliseconds=750`

The following set of tables specifies all of the possible settings by category.

>NOTE: The settings provided below follow the Netflix Hystrix implementation closely. Consequently, you should read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki for more detail on each setting and how it affects Hystrix command operations.

#### 1.2.3.1 Execution

The following table describes the settings that control how the HystrixCommand's `RunAsync()` method runs:

|Key|Description|Default|
|---|---|---|
|timeout:enabled|Enables or disables `RunAsync()` timeouts|true|
|isolation:strategy|`THREAD` or `SEMAPHORE`|`THREAD`|
|isolation:thread:timeoutInMilliseconds|Time allowed for `RunAsync()` execution completion before fallback is executed|1000|
|isolation:semaphore:maxConcurrentRequests|Maximum requests to `RunAsync()` method when using the `SEMAPHORE` strategy|10|

Each setting is prefixed with a key of `execution`, as shown in the following example:

`hystrix:command:sample:execution:isolation:strategy=SEMAPHORE`

#### 1.2.3.2 Fallback

The following table describes the settings that control how the HystrixCommand's `RunFallbackAsync()` method runs:

|Key|Description|Default|
|---|---|---|
|enabled|Enables or disables `RunFallbackAsync()`|true|
|isolation:semaphore:maxConcurrentRequests|Maximum requests to `RunFallbackAsync()` method when using the `SEMAPHORE` strategy|10|

Each setting is prefixed with a key of `fallback`, as shown in the following example:

`hystrix:command:sample:fallback:enabled=false`

#### 1.2.3.3 Circuit Breaker

The following table describes the settings that control the behavior of the default Circuit Breaker used by Hystrix commands:

|Key|Description|Default|
|---|---|---|
|enabled|Enables or disables circuit breaker usage|true|
|requestVolumeThreshold|Minimum number of requests in a rolling window that will trip the circuit|20|
|sleepWindowInMilliseconds|Amount of time, after tripping the circuit, to reject requests before allowing attempts again|5000|
|errorThresholdPercentage|Error percentage at or above which the circuit should trip open and start short-circuiting requests to fallback logic|50|
|forceOpen|Force circuit open|false|
|forceClosed|Force circuit closed|false|

Each setting is prefixed with a key of `circuitBreaker`, as shown in the following example:

`hystrix:command:sample:circuitBreaker:enabled=false`

#### 1.2.3.4 Metrics

The following table describes the settings that control the behavior of capturing metrics from Hystrix commands:

|Key|Description|Default|
|---|---|---|
|rollingStats:timeInMilliseconds|duration of the statistical rolling window, used by circuit breaker and for publishing|10000|
|rollingStats:numBuckets|number of buckets the rolling statistical window is divided into|10|
|rollingPercentile:enabled|indicates whether execution latencies should be tracked and calculated as percentiles|true|
|rollingPercentile:timeInMilliseconds|duration of the rolling window in which execution times are kept to allow for percentile calculations|60000|
|rollingPercentile:numBuckets|number of buckets the rollingPercentile window will be divided into|6|
|rollingPercentile:bucketSize|maximum number of execution times that are kept per bucket|100|
|healthSnapshot:intervalInMilliseconds| time to wait between allowing health snapshots to be taken that calculate success and error percentages affecting circuit breaker status|500|

Each setting is prefixed with the key `metrics`, as shown in the following example:

`hystrix:command:sample:metrics:rollingPercentile:enabled=false`

#### 1.2.3.5 Request Cache

The following table describes the settings that control whether Hystrix command request caching is enabled or disabled:

|Key|Description|Default|
|---|---|---|
|enabled|Enables or disables request scoped caching|true|

Each setting is prefixed with the key `requestCache`, as shown in the following example:

`hystrix:command:sample:requestCache:enabled=false`

#### 1.2.3.6 Request Logging

The following table describes the settings that control whether Hystrix command execution events are logged to the Request log:

|Key|Description|Default|
|---|---|---|
|enabled|enable or disable request scoped logging|true|

Each setting is prefixed with the key `requestLog`, as shown in the following example:

`hystrix:command:foobar:requestLog:enabled=false`

#### 1.2.3.7 Thread Pool

The following table describes the settings that control what and how the command uses the Hystrix thread pools:

|Key|Description|Default|
|---|---|---|
|threadPoolKeyOverride|Sets the thread pool used by the command|command group key name|

The following listing shows an example:

`hystrix:command:setting:threadPoolKeyOverride=FortuneServiceTPool`

### 1.2.4 Thread Pool Settings

In addition to configuring the settings for Hystrix commands, you can also configure the settings that Steeltoe Hystrix uses in creating and managing its thread pools.

In most cases, you can take the defaults and not have to configure these settings.

As with the Hystrix command settings, there are four levels of precedence that are followed and applied by the framework:

1. `Fixed global pool settings`: These are the defaults for all Hystrix pools. If nothing else is specified, these settings are used.
1. `Configured global pool settings`: These are the defaults specified in configuration files that override the fixed values above and apply to all Hystrix pools.
1. `Pool settings specified in code`: These are the settings you specify in the constructor of your Hystrix thread pool. These settings apply to all commands that are created that reference that pool.
1. `Configured pool specific settings`: These are the settings specified in configuration files that are targeted at named thread pools and apply to all commands that are created that reference that pool.

All configured thread pool settings should be placed under the prefix with a key of `hystrix:threadpool:`.

All configured global settings, as described earlier in #2, should be placed under a prefix of `hystrix:threadpool:default:`. The following example configures the default number of threads in all thread pools to be 20:

`hystrix:threadpool:default:coreSize=20`

To configure the settings for a thread pool in code, use the [`HystrixThreadPoolOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.HystrixBase/HystrixThreadPoolOptions.cs) type found in the `Steeltoe.CircuitBreaker.HystrixBase` package.

All configured pool-specific settings, as described in #4 above, should be placed under a prefix of `hystrix:threadpool:HYSTRIX_THREADPOOL_KEY:`, where `HYSTRIX_THREADPOOL_KEY` is the `name` of the thread pool. Note that the default name of the thread pool used by a command, if not overridden, is the command group name applied to the command. The following example configures the number of threads for the Hystrix thread pool with a `name` of `sample` to be 40:

`hystrix:threadpool:foobar:coreSize=40`

The tables in the following sections specify all of the possible settings.

>NOTE: the settings provided below follow the Netflix Hystrix implementation closely. Consequently, you should read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki for more detail on each setting and how it affects Hystrix thread pool operations.

#### 1.2.4.1 Sizing

These settings control the sizing of various aspects of the thread pool. There is no additional prefix used in these settings.

|Key|Description|Default|
|---|---|---|
|coreSize|Sets the thread pool size.|10|
|maximumSize|Maximum size of threadPool. See `allowMaximumSizeToDivergeFromCoreSize`.|10|
|maxQueueSize|Maximum thread pool queue size. `value=-1` uses the sync queue.|-1|
|queueSizeRejectionThreshold|Sets the queue size rejection threshold. An artificial maximum queue size, at which rejections occur even if maxQueueSize has not been reached, does not apply if `maxQueueSize=-1`.|5|
|keepAliveTimeMinutes|Currently not used.|1|
|allowMaximumSizeToDivergeFromCoreSize|Lets the configuration for `maximumSize` take effect.|false|

The following listing shows an example:

`hystrix:threadPool:foobar:coreSize=20`

#### 1.2.4.2 Metrics

The following table describes the settings that control the behavior of capturing metrics from Hystrix thread pools:

|Key|Description|Default|
|---|---|---|
|rollingStats.timeInMilliseconds|Duration of the statistical rolling window. Defines how long metrics are kept for the thread pool.|10000|
|rollingStats.numBuckets|Number of buckets into which the rolling statistical window is divided.|10|

Each setting is prefixed with a key of `metrics`, as shown in the following example:

`hystrix:threadpool:sample:metrics:rollingStats:timeInMilliseconds=20000`

### 1.2.5 Collapser Settings

The last group of settings you can configure pertain to the usage of a Hystrix collapser.

As with all other Hystrix settings, there are four levels of precedence that are followed and applied by the framework:

1. `Fixed global collapser settings`: The defaults for all Hystrix collapsers. Used if nothing else is specified.
1. `Configured global collapser settings`: Settings in application configuration. Overrides fixed global settings for all Hystrix collapsers.
1. `Collapser settings specified in code`: Specified in the constructor of your Hystrix collapser. Applies to all collapsers that are created with that set of options.
1. `Configured collapser specific settings`: Specified in application configuration for named collapsers. Applies to all collapsers created with that name.

All configured collapser settings should be placed under a prefix of `hystrix:collapser:`.

All configured global settings, as described in #2 above, should be placed under a prefix of `hystrix:collapser:default:`. The following example configures the default number of milliseconds after which a batch of requests created by the collapser triggers and runs all of the requests:

`hystrix:collapser:default:timerDelayInMilliseconds=20`

If you wish to configure the settings for a collapser in code, you must use the [`HystrixCollapserOptions`](https://github.com/SteeltoeOSS/CircuitBreaker/blob/master/src/Steeltoe.CircuitBreaker.HystrixBase/HystrixCollapserOptions.cs) found in the `Steeltoe.CircuitBreaker.HystrixBase` package.

All configured collapser specific settings, as described in #4 above, should be placed under a  prefix of `hystrix:collapser:HYSTRIX_COLLAPSER_KEY:`, where `HYSTRIX_COLLAPSER_KEY` is the "name" of the collapser.

>NOTE: The default name of the collapser, if not specified, is the type name of the collapser.

The following example configures the number of milliseconds after which a batch of requests that have been created by the collapser with a name of `sample` triggers and runs all of the requests:

`hystrix:collapser:foobar:timerDelayInMilliseconds=400`

The tables that follow specify all of the possible settings.

>NOTE: The settings provided in the tables follow the Netflix Hystrix implementation closely. Consequently, you should read the [Configuration section](https://github.com/Netflix/Hystrix/wiki/Configuration) on the Netflix Hystrix wiki for more detail on each setting and how it affects Hystrix collapser operations.

#### 1.2.5.1 Sizing

The following table describes the settings that control the sizing of various aspects of collapsers:

|Key|Description|Default|
|---|---|---|
|maxRequestsInBatch|sets the max number of requests in a batch|INT32.MaxValue|
|timerDelayInMilliseconds|delay before a batch is executed|10|
|requestCacheEnabled|indicates whether request cache is enabled|true|

There is no additional prefix used in these settings.

The following listing shows an example:

`hystrix:collapser:sample:timerDelayInMilliseconds=400`

#### 1.2.5.2 Metrics

The following table describes the settings that control the behavior of capturing metrics from Hystrix collapsers.

|Key|Description|Default|
|---|---|---|
|rollingStats:timeInMilliseconds|Duration of the statistical rolling window. Used by circuit breaker and for publishing.|10000|
|rollingStats:numBuckets|Number of buckets into which the rolling statistical window is divided.|10|
|rollingPercentile:enabled|Indicates whether execution latencies should be tracked and calculated as percentiles.|true|
|rollingPercentile:timeInMilliseconds|Duration of the rolling window in which execution times are kept to allow for percentile calculations.|60000|
|rollingPercentile:numBuckets|Number of buckets into which the rollingPercentile window will be divided.|6|
|rollingPercentile:bucketSize|Maximum number of execution times that are kept per bucket.|100|

Each setting is prefixed with a key of `metrics`, as shown in the following example:

`hystrix:collapser:foobar:metrics:rollingPercentile:enabled=false`

### 1.2.6 Configure Settings

The most convenient way to configure settings for Hystrix is to put them in a file and then use one of the file-based .NET configuration providers to read them.

The following example shows some Hystrix settings in JSON that configure the `FortuneService` command to use a thread pool with a name of `FortuneServiceTPool`.

```json
{
  "spring": {
    "application": {
      "name": "fortuneui"
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
  ...
}
```

The samples and most templates are already set up to read from `appsettings.json`. See [Reading Configuration Values](#reading-configuration-values) for more information on reading configuration values.

### 1.2.7 Add Commands

Once you have read in your configuration data, you are ready to add the Hystrix commands to the dependency injection container, thereby making them available for injection in your application. There are several Steeltoe extension methods available to help.

>NOTE: Adding your commands to the container is not required. You can create them at any point in your application.

To make your Hystrix commands injectable, use the `AddHystrixCommand()` extension methods provided by Steeltoe in the `ConfigureServices()` method of the `Startup` class, as shown in the following example:

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
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
    ...
```

You must follow one important requirement if you wish to use the `AddHystrixCommand()` extension methods: When you define your HystrixCommand, define a public constructor with the first argument a `IHystrixCommandOptions` (that is, `HystrixCommandOptions`).  You need not create or populate the `IHystrixCommandOptions`. The `AddHystrixCommand()` extension method does that for you by using the configuration data you provide in the extension method call.

The following example shows how to define a compatible constructor:

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

Notice that `FortuneServiceCommand` inherits from `HystrixCommand<Fortune>`. It is a command that returns results of type `Fortune`. Further notice that the constructor has `IHystrixCommandOptions` as a first argument. You can add additional constructor arguments.

### 1.2.8 Use Commands

If you have used the `AddHystrixCommand()` extension methods described earlier, you can get an instance of the command in your controller or view by addig the command as an argument in the constructor.

The following example controller uses a Hystrix command called `FortuneServiceCommand`, which was added to the container by using `AddHystrixCommand<FortuneServiceCommand>("FortuneService", Configuration)`.

The controller uses the `RandomFortuneAsync()` method on the injected command to retrieve a fortune, as shown in the following example:

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

The following example shows the definition of the Hystrix command used above.

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

The `FortuneServiceCommand` class is a Hystrix command and is intended to be used in retrieving Fortunes from a Fortune microservice. It uses another service, `IFortuneService` to actually make the request.

In the preceding example, notice that the `FortuneServiceCommand` constructor takes a `IHystrixCommandOptions` as its first parameter. This is the command's configuration, and it has been previously populated with configuration data during `Startup`.

Further notice that the two protected methods, `RunAsync()` and `RunFallbackAsync()`, are the worker methods for the command and are the methods that do the work of the Hystrix command.

The `RunAsync()` method uses the `IFortuneService` to make a REST request of the Fortune microservice, returning the result as a `Fortune`. The `RunFallbackAsync()` method returns a hard-coded `Fortune`.

To invoke the command, the controller code invokes the async method, `RandomFortuneAsync()`, to start command execution. This method calls the `HystrixCommand` method `ExecuteAsync()`.

There are multiple ways for commands to begin running.

To execute a command synchronously, use the `Execute()` method, as shown in the following example:

```csharp
var command = new FortuneServiceCommand(...);
var result = command.Execute();
```

To execute a command asynchronously, use the `ExecuteAsync()` method:

```csharp
var command = new FortuneServiceCommand(...);
var result = await command.ExecuteAsync();
```

You can also use Rx.NET extensions and observe the results of a command by using the `Observe()` method. The `Observe()` method returns a `hot` observable, which has already started execution upon return. The following listing shows an example:

```csharp
var command = new FortuneServiceCommand(...);
IObservable<Fortune> observable = command.Observe();
var result = await observable.FirstOrDefaultAsync();
```

Alternatively, you can use the `ToObservable()` method to return a `cold` observable for the command. Upon return, the command has not started running. Instead, when you `Subscribe()` to it, the underlying command begin to run, and the results are available in the Observer's `OnNext(result)` method. The following listing shows an example:

```csharp
var command = new FortuneServiceCommand(...);
IObservable<Fortune> cold = command.ToObservable();
IDisposable subscription = cold.Subscribe((result) => { Console.WriteLine(result); });
```

### 1.2.9 Add Collapsers

In addition to Hystrix commands, you also might want to use Hystrix collapsers in your applications. Hystrix collapsers let you collapse multiple requests into a batch of requests that can then be executed by a single underlying HystrixCommand.

Collapsers can be configured to use a batch size or an elapsed time since the creation of the batch as triggers for executing the underlying Hystrix command.

There are two styles of request-collapsing supported by Hystrix: `request-scoped` and `globally-scoped`. You configure which style to use when you construct the collapser. The default is `request-scoped`. A `request-scoped` collapser collects a batch of requests for each `HystrixRequestContext`. A `globally-scoped` collapser collects a batch across multiple `HystrixRequestContext` instances.

As with Hystrix commands, you can also add a Hystrix collapsers to the service container, making them available for injection in your application. You can use several Steeltoe extension methods to help you accomplish this.

>NOTE: Adding collapsers to the container is not required. You can create them in your application at any point.

If you do want to have them injected, then use the `AddHystrixCollapser()` extension methods provided by the Steeltoe package in the `ConfigureServices()` method of the `Startup` class, as shown in the following example:

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
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

    ...
```

As with Hystrix commands, you must follow an important requirement if you wish to use the `AddHystrixCollapser()` extension methods: When you define your HystrixCollapser, you must define a public constructor with a `IHystrixCollapserOptions` (that is, `HystrixCollapserOptions`) as the first argument.  You need not create or populate its contents. Instead, the `AddHystrixCollapser()` extension method does that for you by using the configuration data you provide in the method call.

The following example shows how to define a compatible constructor:

```csharp
public class FortuneServiceCollapser  : HystrixCollapser<List<Fortune>, Fortune, int>,
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

Notice that `FortuneServiceCollapser` inherits from `HystrixCollapser<List<Fortune>, Fortune, int>`. It is a collapser that returns results of type `List<Fortune>`. Further notice that the constructor has `IHystrixCollapserOptions` as a first argument and that you can add additional constructor arguments. However, the first argument must be a `IHystrixCollapserOptions`.

### 1.2.10 Use Collapsers

You can use Hystrix collapsers in a similar way to the way you use Hystrix commands. If you add the collapser to the service container, you can inject it into any controller, view, or other services created by the container.

The following example controller uses a Hystrix collapser called `FortuneServiceCollapser` that was added to the container by using `AddHystrixCollapser<FortuneServiceCollapser>("FortuneCollapser", Configuration)`.

The controller uses the `ExecuteAsync()` method on the injected command to retrieve a fortune by `Id`, as shown in the following example:

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

The following listing shows the definition of the Hystrix collapser used in the previous example.

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

The `FortuneServiceCollapser` class is a Hystrix collapser and is intended to batch up requests for Fortunes and then run a single Hystrix command called `MultiFortuneServiceCommand` to return a `List<Fortune>`.

To understand how the collapser functions, you first need to understand what happens during the processing of an incoming request. For each incoming request, each separate run of a `FortuneServiceCollapser` instance causes the Hystrix collapser to add a request into a batch of requests to be handed off to a `MultiFortuneServiceCommand` created by `CreateCommand()`, shown in the previous example.

Notice that `CreateCommand()` takes a collection of `ICollapsedRequest<Fortune, int>` requests as an argument. Each element of that collection represents a request for a specific `Fortune` referred to by `Id` (an Integer) as an argument. For each of those requests, `CreateCommand` returns the Hystrix command responsible for executing those requests and returning a list of `Fortunes`.

Next, notice the `MapResponseToRequests` method. After the `MultiFortuneServiceCommand` finishes, some logic must be applied to map the `Fortunes` returned from the command (as `List<Fortune> batchResponse`) to the individual requests (in `ICollection<ICollapsedRequest<Fortune, int>> requests`) that we started with. Doing so enables each separate execution of a `FortuneServiceCollapser` that has been used to group a request to run asynchronously and to return the `Fortune` that was requested by it.

As with Hystrix commands, you have multiple ways in which you can cause collapsers to begin executing.

To execute a collapser synchronouslym, you can use the `Execute()` method, as shown in the following example:

```csharp
var collapser = new FortuneServiceCollapser(...);
var result = collapser.Execute();
```

To execute a collapser asynchronously, you can use the `ExecuteAsync()` method:

```csharp
var collapser = new FortuneServiceCollapser(...);
var result = await collapser.ExecuteAsync();
```

You can also use Rx.NET extensions and observe the results by using the `Observe()` method. The `Observe()` method returns a `hot` observable that has already started execution.

```csharp
var collapser = new FortuneServiceCollapser(...);
IObservable<Fortune> observable = collapser.Observe();
var result = await observable.FirstOrDefaultAsync();
```

Alternatively, you can use the `ToObservable()` method to return a `cold` observable that has not started. Then, when you `Subscribe()` to it, the underlying collapser begins execution, and the results are available in the Observer's `OnNext(result)` method.

```csharp
var collapser = new FortuneServiceCollapser(...);
IObservable<Fortune> cold = collapser.ToObservable();
IDisposable subscription = cold.Subscribe((result) => { Console.WriteLine(result); });
```

### 1.2.11 Use Metrics

As HystrixCommands run, they generate metrics and status information on outcomes and latency and thread pool usage. This information can be useful in monitoring and managing your applications. The Hystrix Dashboard enables you to extract and view these metrics in real time.

With Steeltoe, you can currently choose from two dashboards.

The first is the [Netflix Hystrix Dashboard](https://github.com/Netflix/Hystrix/wiki/Dashboard). This dashboard is appropriate when you are not running your application on Cloud Foundry -- for example, when you are developing and testing your application locally on your desktop.

The second is the [Spring Cloud Services Hystrix Dashboard](https://docs.pivotal.io/spring-cloud-services/1-5/common/circuit-breaker/). This dashboard is part of the [Spring Cloud Services](https://docs.pivotal.io/spring-cloud-services/1-5/common/) offering and is made available to applications through the normal service instance binding mechanisms on Cloud Foundry.

>NOTE: As described in the [Add NuGet References](#1-2-1-add-nuget-references) section, depending on which dashboard you target, you must include the correct Steeltoe NuGet in your project.

You should use the `Steeltoe.CircuitBreaker.Hystrix.MetricsEventsCore` package in an ASP.NET Core application when targeting the Netflix Hystrix Dashboard. When added to your app, it exposes a new REST endpoint in your application: `/hystrix/hystrix.stream`. This endpoint is used by the Netflix dashboard in receiving `SSE` metrics and status events from your application.

You should use the `Steeltoe.CircuitBreaker.Hystrix.MetricsStreamCore` package in an ASP.NET Core application when targeting the Spring Cloud Services Hystrix Dashboard. When added to your app, it starts up a background thread and uses messaging to push the metrics to the bound dashboard.

Regardless of which dashboard or package you choose to use, to enable your application to emit metrics and status information, you must make three changes in your `Startup` class:

* Add Hystrix Metrics stream service to the service container
* Use Hystrix Request context middleware in pipeline
* Start Hystrix Metrics stream

To add the metrics stream to the service container, you must use the `AddHystrixMetricsStream()` extension method in the `ConfigureService()` method in your `Startup` class, as shown in the following example:

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
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
    ...
```

Next, you must configure a couple of Hystrix related items in the request processing pipeline. You can do so in the `Configure()` method of the `Startup` class.

First, metrics requires that Hystrix Request contexts be initialized and available in every request being processed. You can enable this by using the Steeltoe extension method `UseHystrixRequestContext()` shown in the next example.

Additionally, in order to start the metrics stream service so that it starts to publish metrics and events, you need to call the `UseHystrixMetricsStream()` extension method. See the contents of the `Configure()` method in the following example:

```csharp
using Steeltoe.CircuitBreaker.Hystrix;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
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
    ...
```

#### 1.2.11.1 Netflix Dashboard

Once you have made the changes described earlier, you can then use the Netflix Hystrix Dashboard by following these instructions:

1. Clone a Hystrix dashboard (<https://github.com/spring-cloud-samples/hystrix-dashboard.git>).
1. Go to the cloned directory (`hystrix-dashboard`) and start the dashboard with `mvn spring-boot:run`.
1. Open a browser and connect to the dashboard (for example, <http://localhost:7979>).
1. In the first field, enter the endpoint in the application that is exposing the hystrix metrics (for example, <http://localhost:5555/hystrix/hystrix.stream>).
1. Click the monitor button.
1. Use your application and see the metrics begin to flow.

#### 1.2.11.2 Cloud Foundry Dashboard

When you want to use a Hystrix Dashboard on Cloud Foundry, you must have previously installed Spring Cloud Services. If that has been done, you can create and bind a instance of the dashboard to the application by using the Cloud Foundry CLI, as follows:

```bash
# Create Hystrix dashboard instance named `myHystrixService`
cf create-service p-circuit-breaker-dashboard standard myHystrixService

# Wait for service to become ready
cf services
```

For more information on using the Hystrix Dashboard on Cloud Foundry, see the [Spring Cloud Services](https://docs.pivotal.io/spring-cloud-services/1-4/common/) documentation.

Once the service is bound to your application, the settings are available in `VCAP_SERVICES`. See [Reading Configuration Values](#reading-configuration-values) for more information on reading configuration values.

Once you have performed the steps described earlier and you have made the changes described in the [Use Metrics](#1-2-11-use-metrics) section, you can use the Spring Cloud Services dashboard by following these instructions:

1. Open a browser and connect to the Pivotal Apps Manager.
1. Follow [these instructions](https://docs.pivotal.io/spring-cloud-services/1-3/common/circuit-breaker/using-the-dashboard.html) to open the Hystrix Dashboard service.
1. Use your application and see the metrics begin to flow.

# Common Steps

This section contains snippets of commands that you are likely to use repeatedly for common tasks.

## Publish Sample

### ASP.NET Core

Use the `dotnet` CLI to [build and locally publish](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-publish) the application for the framework and runtime you will deploy the application to:

* Linux with .NET Core: `dotnet publish -f netcoreapp2.1 -r ubuntu.14.04-x64`
* Windows with .NET Core: `dotnet publish -f netcoreapp2.1 -r win10-x64`
* Windows with .NET Platform: `dotnet publish -f net461 -r win10-x64`

>NOTE: Starting with .NET Core 2.0, the `dotnet publish` command will automatically restore dependencies for you. Running `dotnet restore` explicitly is not generally required.

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

Manifest file names may vary, some samples use a different manifest for .NET 4 vs .NET Core.

>NOTE: All sample manifests have been defined to bind their application to their services, as created earlier.

## Reading Configuration Values

Once settings have been defined, the next step is to read them so that they can be made available.

The following code reads settings from the `appsettings.json` file with the .NET JSON configuration provider (`AddJsonFile("appsettings.json"))` and from `VCAP_SERVICES` with `AddCloudFoundry()`:

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

Both sources are then added to the configuration builder.

When pushing the application to Cloud Foundry, the settings from service bindings merge with the settings from other configuration mechanisms (such as `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration take precedence and overrides all others.

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool such as [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config).

>NOTE: If you use the Spring Cloud Config Server, `AddConfigServer()` automatically calls `AddCloudFoundry()` for you.
