---
title: Management
order: 70
date: 2016/4/1
tags:
---

Steeltoe includes a number of optional features you can add to your applications to aid in monitoring and managing it while its running in production. These features are implemented as a number of management endpoints which you can easily add to your application.

The way the endpoints are exposed and used depends on the type of technology you choose in exposing the functionality of the endpoint. Out of the box, Steeltoe provides an easy way to expose these endpoints using HTTP in an ASP.NET Core application. Of course you have the option to build and use whatever you would like to meet your needs and your situation.

When you expose the endpoints over HTTP, you are also able to easily integrate the endpoints with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html). The quick start below, explores this integration in more depth and you're encouraged to read the [Using Actuators with Apps Manager section](https://docs.pivotal.io/pivotalcf/2-0/console/using-actuators.html) of the Pivotal Cloud Foundry documentation for more details.

> Note: Currently the Steeltoe Management endpoints do not expose the `/mappings` endpoint which can be queried from the Pivotal Apps Manager.

# 0.0 Initialize Dev Environment

All of the Steeltoe sample applications are in the same repository. If you haven't already, use git to clone the repository or download with your browser from GitHub: [Steeltoe Samples](https://github.com/SteeltoeOSS/Samples)

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
```

> Note: all Management samples in the Samples repository have a base path of `Samples/Management/src/`

Make sure your Cloud Foundry CLI tools are logged in and targeting the correct org and space:

```bash
> cf login [-a API_URL] [-u USERNAME] [-p PASSWORD] [-o ORG] [-s SPACE] [--skip-ssl-validation]
or
> cf target -o <YourOrg> -s <YourSpace>
```

# 1.0 Management Endpoints

Below is a table of all of the currently available Steeltoe management endpoints. More details on each is provided in upcoming sections.

|ID|Description|
|---|---|
|**health**|Customizable endpoint that reports application health information|
|**info**|Customizable endpoint that reports arbitrary application information (e.g. Git Build info, etc.)|
|**loggers**|Allows remote access and modification of logging levels in a .NET application|
|**trace**|Reports a configurable set of trace information (e.g. last 100 HTTP requests)|
|**dump**|Generates and reports a snapshot of the applications threads (Windows only)|
|**heapdump**|Generates and downloads a mini-dump of the application (Windows only)|
|**cloudfoundry**|Enables management endpoint integration with Pivotal Cloud Foundry|

Note that the Steeltoe Management endpoints themselves support the following .NET application types:

* ASP.NET - MVC, WebForm, WebAPI, WCF
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

When you use the provided Steeltoe components to expose the endpoints using HTTP, then you will find those components support ASP.NET Core.

In addition to the Quick Start below, there are other Steeltoe sample applications that you can refer to in order to help you understand how to use these endpoints:

* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) - a sample app illustrating how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.

## 1.1 Quick Start

This quick start consists of an ASP.NET Core sample app illustrating how to use all of the above management endpoints on Cloud Foundry and integrating the endpoint information via HTTP with [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html).

For more information on how to use the Apps Manager with the Management endpoints, read the [Using Spring Boot Actuators with Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/using-actuators.html) section.

> Note: Steeltoe Management is not exclusive to Cloud Foundry

### 1.1.1 Locate Sample

```bash
> cd Samples/Management/src/AspDotNetCore/CloudFoundry
```

### 1.1.2 Create Service

You must first create an instance of a MySql service in a org/space. This is necessary in order to illustrate how a custom Health contributor can be created to monitor the health of a connection to a back-end database.

```bash
> # Create a MySql service instance on Cloud Foundry
> cf create-service p-mysql 100mb myMySqlService
>
> # Make sure the service is ready
> cf services
```

### 1.1.3 Publish Sample

See [Publish Sample](#publish-sample) for instructions on how to publish this sample to either Linux or Windows.

### 1.1.4 Push Sample

See [Push Sample](#push-sample) for instructions on how to push this sample to either Linux or Windows on Cloud Foundry.

### 1.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs actuator`)

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

### 1.1.6 What to expect

At this point the app is up and running.

You can access the management endpoints exposed by Steeltoe using the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html).

The Steeltoe Management framework exposes Spring Boot Actuator compatable endpoints which can be used within the Pivotal Apps Manager. By using the Apps Manager, you can view the Apps Health, Build Information (e.g. Git info, etc), and recent Request/Response Traces, as well as manage/change the applications logging levels. In addition, when the application is running on a Windows cell, you will be able to get thread snapshots and generate and download mini-dumps of the application.

Check out the Pivotal Apps Manager, [Using Spring Boot Actuators](https://docs.pivotal.io/pivotalcf/2-0/console/using-actuators.html) for more information on how to use the Apps Manager.

### 1.1.7 Understand Sample

The sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` )  and then modified to use the Steeltoe frameworks.

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

* `CloudFoundry.csproj` - Multiple changes as follows:
  * GitInfo `PackageReference` added to gather git build information for the App Info endpoint.
  * _GitProperties `Target` added to build the `git.properties` file used by the Git App Info contributor.
  * Added `Steeltoe.Management.CloudFoundry` package reference to bring in all Management endpoints for use on Cloud Foundry
  * Added various MySql package references to enable use of MySql in the application
* `Program.cs` - Code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry configuration values when pushed to Cloud Foundry, to use CloudFoundry hosting and to setup Steeltoe dynamic logging.
* `Startup.cs` - Multiple changes as follows:
  * Code added to `ConfigureServices()` to use the Steeltoe MySQL connector.
  * Code added to `ConfigureServices()` to add a custom health contributor, `MySqlHealthContributor` to the service container.
  * Code added to `ConfigureServices()` to add all of the Steeltoe Management endpoints to the service container.
  * Code added to `Configure()` to add the Steeltoe Management middleware to the pipeline.
* `MySqlHealthContributor.cs` - A custom Health contributor that monitors the MySql database.

## 1.2 Usage

You should understand how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the management endpoints. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the endpoints.

You should also understand how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()`  and `Configure()` methods.

> Note: Currently, code is provided to expose the Management endpoints via HTTP within ASP.NET Core applications. Future support for other application types is in the works.

As mentioned earlier, the available Steeltoe management endpoints that can be used in an application is shown below.

|ID|Description|
|---|---|
|**health**|Customizable endpoint that gathers application health information|
|**info**|Customizable endpoint that gathers arbitrary application information (e.g. Git Build info)|
|**loggers**|Gathers existing loggers and allows modification of logging levels|
|**trace**|Gathers a configurable set of trace information (e.g. last 100 HTTP requests)|
|**dump**|Generates and reports a snapshot of the applications threads (Windows only)|
|**heapdump**|Generates and downloads a mini-dump of the application (Windows only)|
|**cloudfoundry**|Enables management endpoint integration with Cloud Foundry|

Each endpoint has an associated ID. When you want to expose that endpoint using HTTP, that ID is used in the mapped URL that exposes the endpoint. For example, the `health` endpoint below will be mapped to `/health`.

> Note: When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) you will need to configure the global management path prefix, as described in the [Endpoint Settings](#1-2-2-settings) section below, to be `/cloudfoundryapplication`. Simply add to your configuration: `management:endpoints:path=/cloudfoundryapplication`

### 1.2.1 Add Nuget References

All of the above mentioned endpoints can be found in the `Steeltoe.Management.EndpointBase` package.

If all you need is access to the functionality of the endpoints, and do *NOT* want to expose them using HTTP (i.e. you want to expose them some other way), then you can simply add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.EndpointBase" Version= "2.0.0"/>
...
</ItemGroup>
```

If you want to expose the endpoints using HTTP in an ASP.NET Core application, but do *NOT* want to integrate with the Pivotal Apps Manager, then you should add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.EndpointCore" Version= "2.0.0"/>
...
</ItemGroup>
```

But most of the time you will want to expose the endpoints using HTTP in an ASP.NET Core application on Cloud Foundry and integrate with the Pivotal Apps Manager. In that case there is a package, `Steeltoe.Management.CloudFoundryCore` that you can reference which will bring in everything you need.

Simply add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.CloudFoundryCore" Version= "2.0.0"/>
...
</ItemGroup>
```

### 1.2.2 Settings

Endpoints can be configured using the normal .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration). You can configure settings globally that apply to all endpoints, as well as configure settings that are specific to a particular endpoint.

All management settings should be placed under the prefix with the key `management:endpoints`. Any settings found under this prefix apply to all endpoints globally.

Settings that you want to apply to a specific endpoint should be placed under the prefix with the key `management:endpoints` + `:` + ID (e.g. `management:endpoints:health`). Any settings you apply to a specific endpoint will override any settings applied globally.

Below are the settings that you can apply globally:

|Key|Description|Default|
|---|---|---|
|enabled|Enable or disable all management endpoints|true|
|path|Path prefix applied to all endpoints when exposed using HTTP|`/`|
|sensitive|Currently not used|false|

When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) you will need to configure the global management path above, to be `/cloudfoundryapplication`.

In the upcoming sections you will find the settings that you can apply to specific endpoints.

### 1.2.3 Health

The Steeltoe Health management endpoint can be used to check the status of your running application. It can often be used by monitoring software to alert someone if a production system goes down.

Health information is collected from all [IHealthContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/IHealthContributor.cs) provided to the [HealthEndpoint](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/HealthEndpoint.cs). Steeltoe includes a few `IHealthContributor` out of the box that you can use, but more importantly you can also write your own.

By default, the final application health state is computed by the [IHealthAggregator](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/IHealthAggregator.cs) that is provided to the `HealthEndpoint`. The `IHealthAggregator` is responsible for sorting out the all of the returned statuses from each `IHealthContributor` and deriving a overall application health state. The [DefaultHealthAggregator](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/DefaultHealthAggregator.cs) simply returns the `worst` status returned from all of the `IHealthContributors`.

#### 1.2.3.1 Health Contributors

The following are the Steeltoe provided `IHealthContributor` implementations:

|Name|Description|
|---|---|
| [DiskSpaceContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/Contributor/DiskSpaceContributor.cs)|Checks for low disk space and you can configure using [DiskSpaceContributorOptions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/Contributor/DiskSpaceContributorOptions.cs)|

To provide custom health information for your application, create a class that implements the `IHealthContributor` interface and then add that to the `HealthEndpoint`.

Below is an example `IHealthContributor` that simply checks the availability of the back-end database by opening a connection and issuing a `SELECT 1;` against the database.

```csharp
public class MySqlHealthContributor : IHealthContributor
{
    MySqlConnection _connection;
    public MySqlHealthContributor(MySqlConnection connection)
    {
        _connection = connection;
    }

    public string Id { get; } = "mySql";

    public Health Health()
    {

        Health result = new Health();
        result.Details.Add("database", "MySQL");
        try
        {
            _connection.Open();
            MySqlCommand cmd = new MySqlCommand("SELECT 1;", _connection);
            var results = cmd.ExecuteScalar();
            result.Details.Add("result", results);
            result.Details.Add("status", HealthStatus.UP.ToString());
            result.Status = HealthStatus.UP;

        } catch (Exception e)
        {
            result.Details.Add("error", e.GetType().Name + ": " + e.Message);
            result.Details.Add("status", HealthStatus.DOWN.ToString());
            result.Status = HealthStatus.DOWN;
        } finally
        {
            _connection.Close();
        }

        return result;
    }
}
```

#### 1.2.3.2 Settings

Below are the settings that you can apply to the Health endpoint. Each setting should be prefixed with `management:endpoints:health`

|Key|Description|Default|
|---|---|---|
|id|The ID of the health endpoint|`health`|
|enabled|Enable or disable health management endpoint|true|
|path|Path to the health endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|
|requiredPermissions|User permissions required on Cloud Foundry to access endpoint|RESTRICTED|

#### 1.2.3.3 HTTP Access

The default path to the Health endpoint will be `/health`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Health actuator to the service container, use any one of the `AddHealthActuator()` extension methods from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Health/EndpointServiceCollectionExtensions.cs).

To add custom `IHealthContributor`s to the service container, add the `IHealthContributor`s to the service container with the Scoped lifetime:

```csharp
public class Startup
{
  .....

  public void ConfigureServices(IServiceCollection services)
  {

      services.AddMySqlConnection(Configuration);

      // Add custom health check contributor
      services.AddScoped<IHealthContributor, MySqlHealthContributor>();

      // Add all management endpoint services
      services.AddCloudFoundryActuators(Configuration);

      // Add framework services.
      services.AddMvc();
  }
}
```

To add the Health actuator middleware to the ASP.NET Core pipeline, use the `UseHealthActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Health/EndpointApplicationBuilderExtensions.cs).

### 1.2.4 Info

The Steeltoe Info management endpoint exposes various application information collected from all [IInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/IInfoContributor.cs) provided to the [InfoEndpoint](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/InfoEndpoint.cs). Steeltoe includes a few `IInfoContributor`s out of the box that you can use, but most importantly you can also write your own.

#### 1.2.4.1 Info Contributors

The following are the Steeltoe provided `IInfoContributor` implementations:

|Name|Description|
|---|---|
| [AppSettingsInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/Contributor/AppSettingsInfoContributor.cs)|Exposes any values from your configuration (e.g. `appsettings.json`) found under the key `info`|
| [GitInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/Contributor/GitInfoContributor.cs)|Exposes git information if a git.properties file is available|

> Note: For an example of how to use the `GitInfoContributor` with MSBuild via [GitInfo](https://github.com/kzu/GitInfo), see the [Steeltoe sample](https://github.com/SteeltoeOSS/Samples/tree/master/Management/src/AspDotNetCore/CloudFoundry) and specifically look at [CloudFoundry.csproj](https://github.com/SteeltoeOSS/Samples/blob/master/Management/src/AspDotNetCore/CloudFoundry/CloudFoundry.csproj).

To provide custom information for your application, create a class that implements the `IInfoContributor` interface and add it to the `InfoEndpoint`.

Below is an example `IInfoContributor` that simply adds `someKey=someValue` to the application's information.

```csharp
public class SampleInfoContributor : IInfoContributor
{
  public void Contribute(IInfoBuilder builder)
  {
    Dictionary<string, object> result = new Dictionary<string, object>();
    result.Add("someKey", "someValue");
    builder.WithInfo(result);
  }
}
```

#### 1.2.4.2 Settings

Below are the settings that you can apply to the Info endpoint. Each setting should be prefixed with `management:endpoints:info`

|Key|Description|Default|
|---|---|---|
|id|The ID of the info endpoint|`info`|
|enabled|Enable or disable info management endpoint|true|
|path|Path to the info endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|
|requiredPermissions|User permissions required on Cloud Foundry to access endpoint|RESTRICTED|

#### 1.2.4.3 HTTP Access

The default path to the Info endpoint will be `/info`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Info actuator to the service container use any one of the `AddInfoActuator()` extension methods from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Info/EndpointServiceCollectionExtensions.cs).

To add custom `IInfoContributor`s to the service container, add the `IInfoContributor`s to the service container with the Singleton lifetime:

```csharp
public class Startup
{
  .....

  public void ConfigureServices(IServiceCollection services)
  {

      services.AddMySqlConnection(Configuration);

      // Add custom info contributor
      services.AddSingleton<IInfoContributor, SampleInfoContributor>();

      // Add all management endpoint services
      services.AddCloudFoundryActuators(Configuration);

      // Add framework services.
      services.AddMvc();
  }

}
```

To add the Info actuator middleware to the ASP.NET Core pipeline, use the `UseInfoActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Info/EndpointApplicationBuilderExtensions.cs).

### 1.2.5 Loggers

The Steeltoe Loggers management endpoint includes the ability to view and configure the logging levels of your application at runtime when using the [Steeltoe Logging provider](https://github.com/SteeltoeOSS/Logging).

You can view a list of all active loggers in an application and their current configuration. The configuration information is made up of both the explicitly configured logging levels as well as the effective logging level given to it by the logging framework.

#### 1.2.5.1 Settings

Below are the settings that you can apply to the Loggers endpoint. Each setting should be prefixed with `management:endpoints:loggers`

|Key|Description|Default|
|---|---|---|
|id|The ID of the loggers endpoint|`loggers`|
|enabled|Enable or disable loggers management endpoint|true|
|path|Path to the loggers endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|
|requiredPermissions|User permissions required on Cloud Foundry to access endpoint|RESTRICTED|

#### 1.2.5.2 HTTP Access

The default path to the endpoint is `/loggers`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the [Steeltoe Logging provider](https://github.com/SteeltoeOSS/Logging) to the `ILoggerFactory`, update the `Program.cs` class as shown below.

```csharp
using Steeltoe.Extensions.Logging;
public class Program
{
    public static void Main(string[] args)
    {
        var host = new WebHostBuilder()
            .UseKestrel()
            .UseContentRoot(Directory.GetCurrentDirectory())
            .UseStartup<Startup>()
            .ConfigureAppConfiguration((builderContext, config) =>
            {
                config.SetBasePath(builderContext.HostingEnvironment.ContentRootPath)
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .AddJsonFile($"appsettings.{builderContext.HostingEnvironment.EnvironmentName}.json", optional: true)
                    .AddEnvironmentVariables();
            })
            .ConfigureLogging((builderContext, loggingBuilder) =>
            {
                loggingBuilder.AddConfiguration(builderContext.Configuration.GetSection("Logging"));

                // Add Steeltoe dynamic console logger
                loggingBuilder.AddDynamicConsole();
            })
            .Build();

        host.Run();
    }
}
```

> Note: the Steeltoe logging provider is a wrapper around the [Microsoft Console Logging](https://github.com/aspnet/Logging) provider from Microsoft. This wrapper allows querying defined loggers and modifying the levels dynamically at runtime. For more information see the [Steeltoe Logging documentation](/docs/steeltoe-logging).

To add the Loggers actuator to the service container, use the `AddLoggersActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Loggers/EndpointServiceCollectionExtensions.cs).

To add the Loggers actuator middleware to the ASP.NET Core pipeline, use the `UseLoggersActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Loggers/EndpointApplicationBuilderExtensions.cs).

### 1.2.6 Tracing

The Steeltoe Tracing endpoint enables the ability to view the last several requests made of your application.

When you activate the Tracing endpoint, a [ITraceRepository](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Trace/ITraceRepository.cs) is configured and created to hold [Trace](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Trace/Trace.cs) information that can be retrieved using the endpoint.

When the Tracing endpoint is used on an ASP.NET Core application, a [TraceObserver](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Trace/TraceObserver.cs) is used to gather details from each incoming HTTP request. The details that are gathered can be configured using the settings outlined below.

#### 1.2.6.1 Settings

Below are the settings that you can apply to the Trace endpoint. Each setting should be prefixed with `management:endpoints:trace`

|Key|Description|Default|
|---|---|---|
|id|The ID of the trace endpoint|`trace`|
|enabled|Enable or disable trace management endpoint|true|
|path|Path to the trace endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|
|capacity|User permissions required on Cloud Foundry to access endpoint|RESTRICTED|
|addRequestHeaders|Add in request headers|true|
|addResponseHeaders|Add in response headers|true|
|addPathInfo|Add in path information|false|
|addUserPrincipal|Add user principal|false|
|addParameters|Add request parameters|false|
|addQueryString|Add query string|false|
|addAuthType|Add authentication type|false|
|addRemoteAddress|Add remote address of user|false|
|addSessionId|Add in session id|false|
|addTimeTaken|Add in time take|true|

#### 1.2.6.2 HTTP Access

The default path to the Trace endpoint will be `/trace`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Trace actuator to the service container, use the `AddTraceActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Trace/EndpointServiceCollectionExtensions.cs).

To add the Trace actuator middleware to the ASP.NET Core pipeline, use the `UseTraceActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Trace/EndpointApplicationBuilderExtensions.cs).

### 1.2.7 Thread Dump

The Steeltoe Thread dump endpoint can be used to generate a snapshot of information about all the threads in your application. That snapshot includes several bits of information for each thread including the threads state, a stack trace, any monitor locks held by the thread, any monitor locks the thread is waiting on, etc.

> Note: At this time, thread dumps are only possible on the Windows operating system. When integrating with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) you will not have the ability to obtain thread dumps from apps running in Linux cells.

#### 1.2.7.1 Settings

Below are the settings that you can apply to the Thread dump endpoint. Each setting should be prefixed with `management:endpoints:dump`

|Key|Description|Default|
|---|---|---|
|id|The ID of the thread dump endpoint|`dump`|
|enabled|Enable or disable thread dump management endpoint|true|
|path|Path to the thread dump endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|

#### 1.2.7.2 HTTP Access

The default path to the Thread Dump endpoint will be `/dump`, unless either the global or the thread dump endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Thread dump actuator to the service container, use the `AddThreadDumpActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/ThreadDump/EndpointServiceCollectionExtensions.cs).

To add the Thread dump actuator middleware to the ASP.NET Core pipeline, use the `UseThreadDumpActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/ThreadDump/EndpointApplicationBuilderExtensions.cs).

### 1.2.8 Heap Dump

The Steeltoe Heap dump endpoint can be used to generate and download a mini-dump of your application. The mini-dump can then be read into Visual Studio for analysis.

> Note: At this time, dumps are only possible on the Windows operating system. When integrating with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) you will not have the ability to obtain dumps from apps running in Linux cells. Also, the heap dump filename used by the Pivotal Apps Manager will end with the extension `.hprof` instead of the expected `.dmp` extension. This may cause problems when opening the dump with Visual Studio or some other diagnostic tool. This issue will be fixed in a future release of the Apps Manager and as a workaround you can simply rename the file to use the `.dmp` extension.

#### 1.2.8.1 Settings

Below are the settings that you can apply to the Heap dump endpoint. Each setting should be prefixed with `management:endpoints:heapdump`

|Key|Description|Default|
|---|---|---|
|id|The ID of the heap dump endpoint|`heapdump`|
|enabled|Enable or disable heap dump management endpoint|true|
|path|Path to the heap dump endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|

#### 1.2.8.2 HTTP Access

The default path to the Heap Dump endpoint will be `/heapdump`, unless either the global or the thread dump endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Thread dump actuator to the service container, use the `AddHeapDumpActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/HeapDump/EndpointServiceCollectionExtensions.cs).

To add the Heap dump actuator middleware to the ASP.NET Core pipeline, use the `UseHeapDumpActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/HeapDump/EndpointApplicationBuilderExtensions.cs).

### 1.2.9 Cloud Foundry

 The primary purpose of this endpoint is to enable integration with the Pivotal Apps Manager. When used, the Steeltoe Cloud Foundry management endpoint enables the following additional functionality on Cloud Foundry:

* Exposes an endpoint which can be queried to return the Ids and links to all of the enabled management endpoints in the application.
* Adds Cloud Foundry security middleware to the request pipeline which secures access to the management endpoints using security tokens acquired from the UAA.
* Adds extension methods which simplify adding all of the Steeltoe management endpoints with HTTP access to the application.

The path that you enable for querying enabled management endpoints must be configured in your settings. When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) you should configure that to be `/cloudfoundryapplication`. See the section on settings below for details.

When adding this management endpoint to your application, the [Cloud Foundry security middleware](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/CloudFoundry/CloudFoundrySecurityMiddleware.cs) will be added to the request processing pipeline of your application to enforce that when a request is made of any of the management endpoints a valid UAA access token is provided as part of that request. Additionally, the security middleware will use the token to determine whether the authenticated user has the permissions needed to access the management endpoint.

#### 1.2.9.1 Settings

Typically you will not need to do any additional configuration, but below are the additional settings that you could apply to the Cloud Foundry endpoint. Each setting should be prefixed with `management:endpoints:cloudfoundry`

|Key|Description|Default|
|---|---|---|
|id|The ID of the Cloud Foundry endpoint|""|
|enabled|Enable or disable Cloud Foundry management endpoint|true|
|path|Path to the Cloud Foundry endpoint when exposed using HTTP|""|
|sensitive|Currently not used|false|
|validateCertificates|Validate server certificates|true|
|applicationId|The ID of the application used in permissions check|VCAP settings|
|cloudFoundryApi|The URL of the Cloud Foundry API|VCAP settings|

> Note: When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) you will need to configure the global management path prefix, as described in the [Endpoint Settings](#1-2-2-settings) section above, to be `/cloudfoundryapplication`. Simply add to your configuration: `management:endpoints:path=/cloudfoundryapplication`

#### 1.2.9.2 HTTP Access

The default path to the CloudFoundry Actuator endpoint is "/". Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the CloudFoundry actuator to the service container, you can use the `AddCloudFoundryActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/CloudFoundry/EndpointServiceCollectionExtensions.cs).

To add the Cloud Foundry actuator and security middleware to the ASP.NET Core pipeline, use the `UseCloudFoundryActuator()` and `UseCloudFoundrySecurity()` extension methods from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/CloudFoundry/EndpointApplicationBuilderExtensions.cs).

# Common References

## Publish Sample

Use the `dotnet` CLI to build and locally publish the application with your preferred framework and runtime:

```bash
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

## Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry using the parameters that match what you selected for framework and runtime:

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

## HTTP Access

There are several steps to expose any of the management endpoints over HTTP:

* Add a reference to `Steeltoe.Management.EndpointCore` or `Steeltoe.Management.CloudFoundryCore`
* Configure endpoint settings, as needed
* `Add` the actuator to the service container (e.g. `AddHealthActuator()`)
* `Use` the middleware to provide HTTP access ( e.g. `UseInfoActuator()`)

> Note: each endpoint will use the same host and port as the application. The default path to each endpoint is specified in its section on this page, along with specific `Add` and `Use` method names.

If you are using all of the Steeltoe endpoints to integrate with Pivotal Apps Manager, use `AddCloudFoundryActuators()` and `UseCloudFoundryActuators()` to add them all at once instead of including individual methods:

```csharp
public class Startup
{
    public IConfiguration Configuration { get; }
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }
    public void ConfigureServices(IServiceCollection services)
    {
        ...
        // Add all managment endpoint services
        services.AddCloudFoundryActuators(Configuration);
        ...
    }
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
    {
        ...
        // Add all management endpoints into pipeline
        app.UseCloudFoundryActuators();
        ...
    }
}
```
