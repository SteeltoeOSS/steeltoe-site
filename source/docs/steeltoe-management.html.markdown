---
title: Management
order: 70
date: 2016/4/1
tags:
---

Steeltoe includes a number of optional features you can add to your applications to aid in monitoring and managing it while it runs in production. These features are implemented as a number of management endpoints that you can easily add to your application.

The way the endpoints are exposed and used depends on the type of technology you choose in exposing the functionality of the endpoint. Out of the box, Steeltoe provides an easy way to expose these endpoints by using HTTP in an ASP.NET Core application. Of course, you can build and use whatever you would like to meet your needs.

When you expose the endpoints over HTTP, you can also integrate the endpoints with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html). The [quick start](#1-1-quick-start), explores this integration in more depth. You should read the [Using Actuators with Apps Manager section](https://docs.pivotal.io/pivotalcf/2-0/console/using-actuators.html) of the Pivotal Cloud Foundry documentation for more details.

>NOTE: Currently, the Steeltoe Management endpoints do not expose the `/mappings` endpoint, which can be queried from the Pivotal Apps Manager.

# 0.0 Initialize Dev Environment

All of the Steeltoe sample applications are in the same repository. If you have not already done so, use git to clone the [Steeltoe Samples](https://github.com/SteeltoeOSS/Samples) repository or download with your browser from GitHub. The following command shows how to use Git to get the samples:

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
```

>NOTE: All Management samples in the Samples repository have a base path of `Samples/Management/src/`.

Make sure your Cloud Foundry CLI tools are logged in and targeting the correct org and space, as shown in the following listing:

```bash
> cf login [-a API_URL] [-u USERNAME] [-p PASSWORD] [-o ORG] [-s SPACE] [--skip-ssl-validation]
or
> cf target -o <YourOrg> -s <YourSpace>
```

# 1.0 Management Endpoints

The following table describes all of the currently available Steeltoe management endpoints:

|ID|Description|
|---|---|
|**health**|Customizable endpoint that reports application health information|
|**info**|Customizable endpoint that reports arbitrary application information (such as Git Build info and other details)|
|**loggers**|Allows remote access and modification of logging levels in a .NET application|
|**trace**|Reports a configurable set of trace information (such as the last 100 HTTP requests)|
|**dump**|Generates and reports a snapshot of the applications threads (Windows only)|
|**heapdump**|Generates and downloads a mini-dump of the application (Windows only)|
|**cloudfoundry**|Enables management endpoint integration with Pivotal Cloud Foundry|

More detail on each endpoint is provided in upcoming sections.

Note that the Steeltoe Management endpoints themselves support the following .NET application types:

* ASP.NET (MVC, WebForm, WebAPI, WCF)
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

Steeltoe currently includes support for exposing the Management endpoints over HTTP with ASP.NET Core.

In addition to the [Quick Start](#1-1-quick-start), there are other Steeltoe sample applications that you can refer to in order to help you understand how to use these endpoints, including:

* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore): A sample application showing how to use all of the Steeltoe components together in a ASP.NET Core application. This is a microservices-based application built from the ASP.NET Core MusicStore reference application provided by Microsoft.

## 1.1 Quick Start

This quick start consists of an ASP.NET Core sample application showing how to use all of the management endpoints on Cloud Foundry and integrating the endpoint information over HTTP with [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html).

For more information on how to use the Apps Manager with the Management endpoints, read [Using Spring Boot Actuators with Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/using-actuators.html).

> Note: Steeltoe Management is not exclusive to Cloud Foundry

### 1.1.1 Locate Sample

To get started, change directory to where the samples are stored, as follows:

```bash
> cd Samples/Management/src/AspDotNetCore/CloudFoundry
```

### 1.1.2 Create Service

To show how a custom Health contributor can be created to monitor the health of a connection to a back-end database, you must first create an instance of a MySql service in a org and space, as shown in the following example:

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

On a Linux cell, you should see something resembling the following during startup:

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

### 1.1.6 Accessing Endpoints

At this point the app is running.

You can access the management endpoints exposed by Steeltoe by using the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html).

The Steeltoe Management framework exposes Spring Boot Actuator compatible endpoints that can be used within the Pivotal Apps Manager. By using the Apps Manager, you can view the Apps Health, Build Information (such as Git info and other details), and recent Request/Response Traces. You can also manage the applications logging levels. On a Windows cell, you can also get thread snapshots and generate and download mini-dumps of the application.

Check out the Pivotal Apps Manager documentation section, [Using Spring Boot Actuators](https://docs.pivotal.io/pivotalcf/2-0/console/using-actuators.html), for more information on how to use the Apps Manager.

### 1.1.7 Understand Sample

The sample was created using the .NET Core tooling `mvc` template (`dotnet new mvc`)  and then modified to use the Steeltoe frameworks.

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

* `CloudFoundry.csproj`: Multiple changes as follows:
  * GitInfo `PackageReference` added to gather git build information for the App Info endpoint.
  * _GitProperties `Target` added to build the `git.properties` file used by the Git App Info contributor.
  * Added `Steeltoe.Management.CloudFoundryCore` package reference to bring in all Management endpoints for use on Cloud Foundry.
  * Added various MySQL package references to enable the use of MySQL in the application.
* `Program.cs`: Added code to the `ConfigurationBuilder` in order to pick up Cloud Foundry configuration values when pushed to Cloud Foundry, to use Cloud Foundry hosting and to setup Steeltoe dynamic logging.
* `Startup.cs`: Multiple changes, as follows:
  * Code added to `ConfigureServices()` to use the Steeltoe MySQL connector.
  * Code added to `ConfigureServices()` to add a custom health contributor, `MySqlHealthContributor`, to the service container.
  * Code added to `ConfigureServices()` to add all of the Steeltoe Management endpoints to the service container.
  * Code added to `Configure()` to add the Steeltoe Management middleware to the pipeline.
* `MySqlHealthContributor.cs`: A custom Health contributor that monitors the MySQL database.

## 1.2 Usage

You should understand how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the management endpoints. You need at least a basic understanding of the `ConfigurationBuilder` and how to add providers to the builder to configure the endpoints.

You should also understand how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Pay particular attention to the usage of the `ConfigureServices()` and `Configure()` methods.

>NOTE: Currently, code is provided to expose the Management endpoints over HTTP within ASP.NET Core applications.

The following table describes the available Steeltoe management endpoints that can be used in an application:

|ID|Description|
|---|---|
|**health**|Customizable endpoint that gathers application health information|
|**info**|Customizable endpoint that gathers arbitrary application information (such as Git Build info)|
|**loggers**|Gathers existing loggers and allows modification of logging levels|
|**trace**|Gathers a configurable set of trace information (such as the last 100 HTTP requests)|
|**dump**|Generates and reports a snapshot of the application's threads (Windows only)|
|**heapdump**|Generates and downloads a mini-dump of the application (Windows only)|
|**cloudfoundry**|Enables management endpoint integration with Cloud Foundry|

Each endpoint has an associated ID. When you want to expose that endpoint over HTTP, that ID is used in the mapped URL that exposes the endpoint. For example, the `health` endpoint below is mapped to `/health`.

>NOTE: When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html), you need to configure the global management path prefix, as described in the [Endpoint Settings](#1-2-2-settings) section, to be `/cloudfoundryapplication`. To do so, add `management:endpoints:path=/cloudfoundryapplication` to your configuration.

### 1.2.1 Add Nuget References

All of the endpoints can be found in the `Steeltoe.Management.EndpointBase` package.

If all you need is access to the functionality of the endpoints, and you do *NOT* want to expose them over HTTP (in other words, you want to expose them some other way), then you can add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.EndpointBase" Version= "2.0.0"/>
...
</ItemGroup>
```

If you want to expose the endpoints over HTTP in an ASP.NET Core application but do *NOT* want to integrate with the Pivotal Apps Manager, you should add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.EndpointCore" Version= "2.0.0"/>
...
</ItemGroup>
```

However, most of the time, you probably want to expose the endpoints over HTTP in an ASP.NET Core application on Cloud Foundry and integrate with the Pivotal Apps Manager. In that case, you can reference a package called `Steeltoe.Management.CloudFoundryCore`, which will bring in everything you need.

To do so, add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.CloudFoundryCore" Version= "2.0.0"/>
...
</ItemGroup>
```

### 1.2.2 Settings

Endpoints can be configured by using the normal .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration). You can globally configure settings that apply to all endpoints as well as configure settings that are specific to a particular endpoint.

All management settings should be placed under the prefix with the key `management:endpoints`. Any settings found under this prefix apply to all endpoints globally.

Settings that you want to apply to a specific endpoint should be placed under the prefix with the key `management:endpoints` + `:` + ID (for example, `management:endpoints:health`). Any settings you apply to a specific endpoint override any settings applied globally.

The following table describes the settings that you can apply globally:

|Key|Description|Default|
|---|---|---|
|enabled|Whether to enable all management endpoints|true|
|path|The path prefix applied to all endpoints when exposed over HTTP|`/`|
|sensitive|Currently not used|false|

When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html), you need to configure the global management path to be `/cloudfoundryapplication`.

The upcoming sections show the settings that you can apply to specific endpoints.

### 1.2.3 Health

The Steeltoe Health management endpoint can be used to check the status of your running application. It can often be used by monitoring software to alert someone if a production system goes down.

Health information is collected from all [IHealthContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/IHealthContributor.cs) implementations provided to the [HealthEndpoint](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/HealthEndpoint.cs). Steeltoe includes a few `IHealthContributor` implementations out of the box that you can use, and, more importantly, you can write your own.

By default, the final application health state is computed by the [IHealthAggregator](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/IHealthAggregator.cs) that is provided to the `HealthEndpoint`. The `IHealthAggregator` is responsible for sorting out the all of the returned statuses from each `IHealthContributor` and deriving an overall application health state. The [DefaultHealthAggregator](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/DefaultHealthAggregator.cs) returns the `worst` status returned from all of the `IHealthContributors`.

#### 1.2.3.1 Health Contributors

At present, Steeltoe provides a single `IHealthContributor` implementation: `DiskSpaceContributor`. [DiskSpaceContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/Contributor/DiskSpaceContributor.cs) checks for low disk space. You can configure it by using [DiskSpaceContributorOptions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Health/Contributor/DiskSpaceContributorOptions.cs).

To provide custom health information for your application, create a class that implements the `IHealthContributor` interface and then add that to the `HealthEndpoint`.

The following example `IHealthContributor` checks the availability of the back-end database by opening a connection and issuing a `SELECT 1;` against the database:

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

The following table describes the settings that you can apply to the Health endpoint.

|Key|Description|Default|
|---|---|---|
|id|The ID of the health endpoint|`health`|
|enabled|Whether to enable the health management endpoint|true|
|path|The path to the health endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|
|requiredPermissions|The user permissions required on Cloud Foundry to access endpoint|RESTRICTED|

IMPORTANT: Each setting must be prefixed with `management:endpoints:health`.

#### 1.2.3.3 HTTP Access

The default path to the Health endpoint is `/health`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Health actuator to the service container, use any one of the `AddHealthActuator()` extension methods from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Health/EndpointServiceCollectionExtensions.cs).

The following example shows how to add custom `IHealthContributor`s to the service container by addinng the `IHealthContributor`s to the service container with the Scoped lifetime:

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

The Steeltoe `Info` management endpoint exposes various application information collected from all [IInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/IInfoContributor.cs) provided to the [InfoEndpoint](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/InfoEndpoint.cs). Steeltoe includes a few `IInfoContributor`s out of the box that you can use, but most importantly you can also write your own.

#### 1.2.4.1 Info Contributors

The following table describes the `IInfoContributor` implementations provided by Steeltoe:

|Name|Description|
|---|---|
| [AppSettingsInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/Contributor/AppSettingsInfoContributor.cs)|Exposes any values from your configuration (such as `appsettings.json`) under the key `info`|
| [GitInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Info/Contributor/GitInfoContributor.cs)|Exposes git information (if a git.properties file is available)|

>NOTE: For an example of how to use the `GitInfoContributor` with MSBuild over [GitInfo](https://github.com/kzu/GitInfo), see the [Steeltoe sample](https://github.com/SteeltoeOSS/Samples/tree/master/Management/src/AspDotNetCore/CloudFoundry) and look at [CloudFoundry.csproj](https://github.com/SteeltoeOSS/Samples/blob/master/Management/src/AspDotNetCore/CloudFoundry/CloudFoundry.csproj).

To provide custom information for your application, create a class that implements the `IInfoContributor` interface and add it to the `InfoEndpoint`.

The following example `IInfoContributor` adds `someKey=someValue` to the application's information:

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

The following table describes the settings that you can apply to the `Info` endpoint:

|Key|Description|Default|
|---|---|---|
|id|The ID of the info endpoint|`info`|
|enabled|Whether to enable info management endpoint|true|
|path|The path to the info endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|
|requiredPermissions|User permissions required on Cloud Foundry to access endpoint|RESTRICTED|

>IMPORTANT: Each setting must be prefixed with `management:endpoints:info`.

#### 1.2.4.3 HTTP Access

The default path to the Info endpoint is `/info`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Info actuator to the service container, you can use any of the `AddInfoActuator()` extension methods from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Info/EndpointServiceCollectionExtensions.cs).

To add custom `IInfoContributor`s to the service container, add the `IInfoContributor`s to the service container with the Singleton lifetime, as shown in the following example:

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

The following table describes the settings that you can apply to the Loggers endpoint.

|Key|Description|Default|
|---|---|---|
|id|The ID of the loggers endpoint|`loggers`|
|enabled|Enable or disable loggers management endpoint|true|
|path|Path to the loggers endpoint when exposed using HTTP|ID|
|sensitive|Currently not used|false|
|requiredPermissions|User permissions required on Cloud Foundry to access endpoint|RESTRICTED|

>IMPORTANT: Each setting must be prefixed with `management:endpoints:loggers`.

#### 1.2.5.2 HTTP Access

The default path to the endpoint is `/loggers`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the [Steeltoe Logging provider](https://github.com/SteeltoeOSS/Logging) to the `ILoggerFactory`, update the `Program.cs` class, as shown in the following example:

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

>NOTE: The Steeltoe logging provider is a wrapper around the [Microsoft Console Logging](https://github.com/aspnet/Logging) provider from Microsoft. This wrapper allows querying defined loggers and modifying the levels dynamically at runtime. For more information, see the [Steeltoe Logging documentation](/docs/steeltoe-logging).

To add the Loggers actuator to the service container, use the `AddLoggersActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Loggers/EndpointServiceCollectionExtensions.cs).

To add the Loggers actuator middleware to the ASP.NET Core pipeline, use the `UseLoggersActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Loggers/EndpointApplicationBuilderExtensions.cs).

### 1.2.6 Tracing

The Steeltoe Tracing endpoint provides the ability to view the last several requests made of your application.

When you activate the Tracing endpoint, an [ITraceRepository](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Trace/ITraceRepository.cs) implementation is configured and created to hold [Trace](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointBase/Trace/Trace.cs) information that can be retrieved using the endpoint.

When the Tracing endpoint is used on an ASP.NET Core application, a [TraceObserver](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Trace/TraceObserver.cs) is used to gather details from each incoming HTTP request. The gathered details can be configured by using the settings described in the next section.

#### 1.2.6.1 Settings

The following table describes the settings that you can apply to the Trace endpoint:

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

>IMPORTANT: Each setting must be prefixed with `management:endpoints:trace`.

#### 1.2.6.2 HTTP Access

The default path to the Trace endpoint is `/trace`, unless either the global or the health endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Trace actuator to the service container, use the `AddTraceActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Trace/EndpointServiceCollectionExtensions.cs).

To add the Trace actuator middleware to the ASP.NET Core pipeline, use the `UseTraceActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/Trace/EndpointApplicationBuilderExtensions.cs).

### 1.2.7 Thread Dump

The Steeltoe Thread dump endpoint can be used to generate a snapshot of information about all the threads in your application. That snapshot includes several bits of information for each thread, including the thread's state, a stack trace, any monitor locks held by the thread, any monitor locks the thread is waiting on, and other details.

>NOTE: At this time, thread dumps are only possible on the Windows operating system. When integrating with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html), you do not have the ability to obtain thread dumps from apps running in Linux cells.

#### 1.2.7.1 Settings

The following table describes the settings that you can apply to the Thread dump endpoint.:

|Key|Description|Default|
|---|---|---|
|id|The ID of the thread dump endpoint|`dump`|
|enabled|Whether to enable the thread dump management endpoint|true|
|path|The path to the thread dump endpoint when exposed over HTTP|ID|
|sensitive|Currently not used|false|

>IMPORTANT: Each setting must be prefixed with `management:endpoints:dump`.

#### 1.2.7.2 HTTP Access

The default path to the Thread Dump endpoint is `/dump`, unless either the global or the thread dump endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Thread dump actuator to the service container, use the `AddThreadDumpActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/ThreadDump/EndpointServiceCollectionExtensions.cs).

To add the Thread dump actuator middleware to the ASP.NET Core pipeline, use the `UseThreadDumpActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/ThreadDump/EndpointApplicationBuilderExtensions.cs).

### 1.2.8 Heap Dump

The Steeltoe Heap dump endpoint can be used to generate and download a mini-dump of your application. The mini-dump can then be read into Visual Studio for analysis.

>NOTE: At this time, dumps are only possible on the Windows operating system. When integrating with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html), you do not have the ability to obtain dumps from apps running in Linux cells. Also, the heap dump filename used by the Pivotal Apps Manager ends with the `.hprof` extension instead of the usual `.dmp` extension. This may cause problems when opening the dump with Visual Studio or some other diagnostic tool. As a workaround, you can rename the file to use the `.dmp` extension.

#### 1.2.8.1 Settings

The following table describes the settings that you can apply to the Heap dump endpoint:

|Key|Description|Default|
|---|---|---|
|id|The ID of the heap dump endpoint|`heapdump`|
|enabled|Whether to enable the heap dump management endpoint|true|
|path|The path to the heap dump endpoint when exposed over HTTP|ID|
|sensitive|Currently not used|false|

>IMPORTANT: Each setting must be prefixed with `management:endpoints:heapdump`.

#### 1.2.8.2 HTTP Access

The default path to the Heap Dump endpoint is `/heapdump`, unless either the global or the thread dump endpoints `path` setting has been changed.

Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Thread dump actuator to the service container, use the `AddHeapDumpActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/HeapDump/EndpointServiceCollectionExtensions.cs).

To add the Heap dump actuator middleware to the ASP.NET Core pipeline, use the `UseHeapDumpActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/HeapDump/EndpointApplicationBuilderExtensions.cs).

### 1.2.9 Cloud Foundry

The primary purpose of this endpoint is to enable integration with the Pivotal Apps Manager. When used, the Steeltoe Cloud Foundry management endpoint enables the following additional functionality on Cloud Foundry:

* Exposes an endpoint that can be queried to return the IDs of and links to all of the enabled management endpoints in the application.
* Adds Cloud Foundry security middleware to the request pipeline, to secure access to the management endpoints by using security tokens acquired from the UAA.
* Adds extension methods that simplify adding all of the Steeltoe management endpoints with HTTP access to the application.

The path that you enable for querying enabled management endpoints must be configured in your settings. When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html), you should configure the path to be `/cloudfoundryapplication`. See the [Settings section](#1-2-9-1-settings) for details.

When adding this management endpoint to your application, the [Cloud Foundry security middleware](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/CloudFoundry/CloudFoundrySecurityMiddleware.cs) is added to the request processing pipeline of your application to enforce that, when a request is made of any of the management endpoints, a valid UAA access token is provided as part of that request. Additionally, the security middleware uses the token to determine whether the authenticated user has permission to access the management endpoint.

#### 1.2.9.1 Settings

Typically, you need not do any additional configuration. However, the following table describes the additional settings that you could apply to the Cloud Foundry endpoint:

|Key|Description|Default|
|---|---|---|
|id|The ID of the Cloud Foundry endpoint|""|
|enabled|Whether to enable Cloud Foundry management endpoint|true|
|path|The path to the Cloud Foundry endpoint when exposed using HTTP|""|
|sensitive|Currently not used|false|
|validateCertificates|Whether to validate server certificates|true|
|applicationId|The ID of the application used in permissions check|VCAP settings|
|cloudFoundryApi|The URL of the Cloud Foundry API|VCAP settings|

>IMPORTANT: Each setting must be prefixed with `management:endpoints:cloudfoundry`.

>NOTE: When you want to integrate with the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html), you need to configure the global management path prefix, as described in the [Endpoint Settings](#1-2-2-settings) section, to be `/cloudfoundryapplication`. To do so, add the following to your configuration: `management:endpoints:path=/cloudfoundryapplication`

#### 1.2.9.2 HTTP Access

The default path to the Cloud Foundry Actuator endpoint is `/`. Refer to the common [enable HTTP Access](#http-access) section for details on enabling HTTP Access.

To add the Cloud Foundry actuator to the service container, you can use the `AddCloudFoundryActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/CloudFoundry/EndpointServiceCollectionExtensions.cs).

To add the Cloud Foundry actuator and security middleware to the ASP.NET Core pipeline, use the `UseCloudFoundryActuator()` and `UseCloudFoundrySecurity()` extension methods from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.EndpointCore/CloudFoundry/EndpointApplicationBuilderExtensions.cs).

# Common References

## Publish Sample

You can use the `dotnet` CLI to build and locally publish the application with your preferred framework and runtime. To get started, run the following command:

```bash
> dotnet restore --configfile nuget.config
```

Then you can use one of the following commands to publish:

* Linux with .NET Core: `dotnet publish -f netcoreapp2.0 -r ubuntu.14.04-x64`
* Windows with .NET Core: `dotnet publish -f netcoreapp2.0 -r win10-x64`
* Windows with .NET Platform: `dotnet publish -f net461 -r win10-x64`

## Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry by using the parameters that match what you selected for framework and runtime, as follows:

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

To expose any of the management endpoints over HTTP:

1. Add a reference to `Steeltoe.Management.EndpointCore` or `Steeltoe.Management.CloudFoundryCore`.
1. Configure endpoint settings, as needed.
1. `Add` the actuator to the service container (for example, `AddHealthActuator()`).
1. `Use` the middleware to provide HTTP access (for example, `UseInfoActuator()`).

>NOTE: Each endpoint uses the same host and port as the application. The default path to each endpoint is specified in its section on this page, along with specific `Add` and `Use` method names.

If you use all of the Steeltoe endpoints to integrate with Pivotal Apps Manager, use `AddCloudFoundryActuators()` and `UseCloudFoundryActuators()` to add them all at once instead of including individual methods, as shown in the following example:

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
