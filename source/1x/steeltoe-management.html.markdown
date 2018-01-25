---
title: Management
order: 70
date: 2016/4/1
tags:
---

Steeltoe includes a number of optional features you can add to your applications to aid in monitoring and managing it while its running in production. These features are implemented as a number of management endpoints which you can easily add to your application.

The way the endpoints are exposed and used depends on the type of technology you choose to expose the functionality of the endpoint. Out of the box, Steeltoe provides an easy way to expose these endpoints using HTTP in an ASP.NET Core application.  Of course you have the option to build and use whatever you would like to meet your needs and your situation.

# 1.0 Management Endpoints

Below is a table of all of the currently available Steeltoe management endpoints.  More details on each is provided in upcoming sections.

|ID|Description|
|------|------|
|**health**|Customizable endpoint that reports application health information|
|**info**|Customizable endpoint that reports arbitrary application information (e.g. Git Build info, etc)|
|**loggers**|Allows remote access and modification of logging levels in a .NET application|
|**trace**|Reports a configurable set of trace information (e.g. last 100 Http requests)|
|**cloudfoundry**|Enables management endpoint integration with Cloud Foundry|

Note that the Steeltoe Management endpoints themselves support the following .NET application types:

* ASP.NET - MVC, WebForm, WebAPI, WCF
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

When you use the provided Steeltoe components to expose the endpoints using HTTP, then you will find those components support ASP.NET Core.

In addition to the Quick Start below, there are other Steeltoe sample applications that you can refer to in order to help you understand how to make use of these endpoints:

* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) -  a sample app illustrating how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.

## 1.1 Quick Start

This quick start consists of an ASP.NET Core sample app illustrating how to use all of the above management endpoints on Cloud Foundry and integrating the endpoint information via HTTP with [Pivotal Cloud Foundry Apps Manager](https://docs.pivotal.io/pivotalcf/1-11/console/index.html).

### 1.1.1 Get Sample

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Management/src/AspDotNetCore/CloudFoundry
```

### 1.1.2 Create Service

You must first create an instance of a MySql service in a org/space. This is necessary in order to illustrate how a custom Health contributor can be created to monitor the health of a connection to a back-end database.

```bash
> # Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
> # Create a MySql service instance on Cloud Foundry
> cf create-service p-mysql 100mb myMySqlService
>
> # Make sure the service is ready
> cf services
```

### 1.1.3 Publish Sample

Use the `dotnet` tool to build and publish the application.

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

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

### 1.1.4 Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry.

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

Note that the manifests have been defined to bind the application to `myMySqlService` created above.

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

Once the app is up and running then you can access the management endpoints exposed by Steeltoe using the [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/1-11/console/index.html).

The Steeltoe Management framework exposes Spring Boot Actuator compatable endpoints which can be used using the Pivotal Apps Manager. By using the Apps Manager, you can view the Apps Health, Build Information (e.g. Git info, etc), and recent Request/Response Traces, as well as manage/change the applications logging levels.

Check out the Apps Manager, [Using Spring Boot Actuators](https://docs.pivotal.io/pivotalcf/1-11/console/using-actuators.html) for more information on how to use the Apps Manager.

### 1.1.7 Understand Sample

The sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` )  and then modified to use the Steeltoe frameworks.

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

* `CloudFoundry.csproj` - Multiple changes as follows:
  * GitInfo `PackageReference` added to gather git build information for the App Info endpoint.
  * _GitProperties `Target` added to build the `git.properties` file used by the Git App Info contributor.
  * Added `Steeltoe.Management.CloudFoundry` package reference to bring in all Management endpoints for use on Cloud Foundry
  * Added various MySql package references to enable use of MySql in the application
* `Program.cs` - Code added to read the `--server.urls` command line.
* `Startup.cs` - Multiple changes as follows:
  * Code added to `ConfigureServices()` to use the Steeltoe MySQL connector.
  * Code added to `ConfigureServices()` to add a custom health contributor, `MySqlHealthContributor` to the service container.
  * Code added to `ConfigureServices()` to add all of the Steeltoe Management endpoints to the service container.
  * Code added to `Configure()` to add the Steeltoe Management middleware to the pipeline.
  * Code added to the `ConfigurationBuilder` in order to pick up Cloud Foundry configuration values when pushed to Cloud Foundry.
* `MySqlHealthContributor.cs` - A custom Health contributor that monitors the MySql database.

## 1.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the management endpoints. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the endpoints.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()`  and `Configure()` methods.

### 1.2.1 Add Nuget References

As mentioned earlier, the available Steeltoe management endpoints that you can enable and use in an application is shown below.

Notice that each endpoint has an associated ID. When you want to expose that endpoint using HTTP, that ID will be used in the mapped URL that exposes the endpoint. For example, the `health` endpoint below will be mapped to `/health`. Also, you will see later that the same ID is used when configuring settings that are specific for an endpoint.

|ID|Description|
|------|------|
|**health**|Customizable endpoint that gathers application health information|
|**info**|Customizable endpoint that gathers arbitrary application information (e.g. Git Build info)|
|**loggers**|Gathers existing loggers and allows modification of logging levels|
|**trace**|Gathers a configurable set of trace information (e.g. last 100 Http requests)|
|**cloudfoundry**|Enables management endpoint integration with Cloud Foundry|

All of the above endpoints can be found in the `Steeltoe.Management.Endpoint` package.

If all you need is access to those endpoints, and do *not* want to expose them using HTTP (i.e. you want to expose them some other way), then you can simply add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.Endpoint" Version= "1.1.0"/>
...
</ItemGroup>
```

But most of the time you will want to expose the endpoints using HTTP, and in that case then you will *not* reference the above package, but instead pull in the `Http Access` package specific to the endpoint you want to expose. See the `Http Access` sections that follow for more details.

Likewise, there will be times when you will want to expose ALL of the above endpoints using HTTP on Cloud Foundry and integrating with the Pivotal Apps Manager. In that case there is a aggregator package, `Steeltoe.Management.CloudFoundry` that you can reference which will bring in everything you need.

Simply add the following `PackageReference` to your `.csproj` file:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.CloudFoundry" Version= "1.1.0"/>
...
</ItemGroup>
```

### 1.2.2 Settings

Endpoints can be configured using the normal .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration). You can configure settings globally that apply to all endpoints, as well as configure settings that are specific to a particular endpoint.

All management settings should be placed under the prefix with the key `management:endpoints`. Any settings found under this prefix apply to all endpoints globally.

Settings that you want to apply to a specific endpoint should be placed under the prefix with the key `management:endpoints` + `:` + ID (e.g. `management:endpoints:health`).  Any settings you apply to a specific endpoint will override any settings applied globally.

Below are the settings that you can apply globally:

|Key|Description|
|------|------|
|**enabled**|Enable or disable all management endpoints, defaults = true|
|**path**|Path prefix applied to all endpoints when exposed using HTTP, defaults = `/`|
|**sensitive**|Currently not used, defaults = false|

In the upcoming sections you will find the settings that you can apply to specific endpoints.

### 1.2.3 Health

The Steeltoe Health management endpoint can be used to check the status of your running application. It can often be used by monitoring software to alert someone if a production system goes down.

Health information is collected from all [IHealthContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Health/IHealthContributor.cs) provided to the [HealthEndpoint](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Health/HealthEndpoint.cs). Steeltoe includes a few `IHealthContributor` out of the box that you can use, but more importantly you can also write your own.

By default, the final application health state is computed by the [IHealthAggregator](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Health/IHealthAggregator.cs) that is also provided to the `HealthEndpoint`.  The `IHealthAggregator` is responsible for sorting out the all of the returned status from each `IHealthContributor` and deriving a overall application health state. The [DefaultHealthAggregator](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Health/DefaultHealthAggregator.cs) simply returns the `worst` status returned from all of the `IHealthContributors`.

#### 1.2.3.1 Contributors

The following are the Steeltoe provided `IHealthContributor` implementations:

|Name|Description|
|------|------|
| [DiskSpaceContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Health/Contributor/DiskSpaceContributor.cs)|Checks for low disk space, configure using [DiskSpaceContributorOptions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Health/Contributor/DiskSpaceContributorOptions.cs)|

When you want to provide custom health information for your application, you can create a class that implements the `IHealthContributor` interface and then add that to the `HealthEndpoint`.

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

Below are the settings that you can apply to the Health endpoint.  Each setting should be prefixed with `management:endpoints:health`

|Key|Description|
|------|------|
|**id**|The ID of the health endpoint, defaults = `health`|
|**enabled**|Enable or disable health management endpoint, defaults = true|
|**path**|Path to the health endpoint when exposed using HTTP, defaults = ID|
|**sensitive**|Currently not used, defaults = false|
|**requiredPermissions**|User permissions required on Cloud Foundry to access endpoint, default=RESTRICTED|

#### 1.2.3.3 Http Access

When you want to expose the Health endpoint over an HTTP connection, you need to do the following in your application:

* Add reference to `Steeltoe.Management.Endpoint.Health` or `Steeltoe.Management.CloudFoundry`
* Optionally, configure the above settings as needed
* Optionally, add any custom `IHealthContributor`s to the service container
* Add the Health actuator to the service container
* Use the Health middleware to provide Http access

Note that the Health endpoint will become accessible via HTTP at the same host and port that the application is using. Also, the path to the endpoint by default will be `/health`, unless either the global or the health endpoints `path` setting has been changed.

If you do *not* want to expose ALL of the Steeltoe endpoints using HTTP on Cloud Foundry then simply add the following `PackageReference` to your `.csproj` file.

If you intended to expose all of the Steeltoe endpoints (e.g. info, health, trace, etc.) then see the [Cloud Foundry](#1-2-7-cloud-foundry) section below, as you'll reference `Steeltoe.Management.CloudFoundry` instead.

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.Endpoint.Health" Version= "1.1.0"/>
...
</ItemGroup>
```

Then to add the Health actuator and any custom `IHealthContributor`s to the service container, you can use any one of the `AddHealthActuator()` extension methods from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Health/EndpointServiceCollectionExtensions.cs).

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `AddCloudFoundryActuators()` instead of specifically adding Health to the service container.

If you do end up using `AddCloudFoundryActuators()` then if you need to add custom `IHealthContributor`s to the service container you should simply add the `IHealthContributor`s to the service container as singleton.

Here is an example:

```csharp
public class Startup
{
  .....

  public void ConfigureServices(IServiceCollection services)
  {

      services.AddMySqlConnection(Configuration);

      // Add custom health check contributor
      services.AddSingleton<IHealthContributor, MySqlHealthContributor>();

      // Add all management endpoint services
      services.AddCloudFoundryActuators(Configuration);

      // Add framework services.
      services.AddMvc();
  }
}
```

Then the last thing you need to do is to add the Health actuator middleware to the ASP.NET Core pipeline. You can use the `UseHealthActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Health/EndpointApplicationBuilderExtensions.cs) to do this.

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `UseCloudFoundryActuators()` instead of specifically adding Health to the pipeline.

### 1.2.4 Info

The Steeltoe Info management endpoint exposes various application information collected from all [IInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Info/IInfoContributor.cs) provided to the [InfoEndpoint](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Info/InfoEndpoint.cs) . Steeltoe includes a few `IInfoContributor`s out of the box that you can use, but most importantly you can also write your own.

#### 1.2.4.1 Contributors

The following are the Steeltoe provided `IInfoContributor` implementations:

|Name|Description|
|------|------|
| [AppSettingsInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Info/Contributor/AppSettingsInfoContributor.cs)|Exposes any values from your configuration (e.g. `appsettings.json`) found under the key `info`|
| [GitInfoContributor](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Info/Contributor/GitInfoContributor.cs)|Expose git information if a git.properties file is available|

Note: For an example of how to use the `GitInfoContributor` together with MSBuild [GitInfo](https://github.com/kzu/GitInfo) targets, see the [Steeltoe sample](https://github.com/SteeltoeOSS/Samples/tree/master/Management/src/AspDotNetCore/CloudFoundry) and specifically look at[CloudFoundry.csproj](https://github.com/SteeltoeOSS/Samples/blob/master/Management/src/AspDotNetCore/CloudFoundry/CloudFoundry.csproj).

When you want to provide custom information for your application, you can create a class that implements the `IInfoContributor` interface and then add that to the `InfoEndpoint`.

Below is an example `IInfoContributor` that simply adds `someKey=someValue` to the applications information.

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

Below are the settings that you can apply to the Info endpoint.  Each setting should be prefixed with `management:endpoints:info`

|Key|Description|
|------|------|
|**id**|The ID of the info endpoint, defaults = `info`|
|**enabled**|Enable or disable info management endpoint, defaults = true|
|**path**|Path to the info endpoint when exposed using HTTP, defaults = ID|
|**sensitive**|Currently not used, defaults = false|
|**requiredPermissions**|User permissions required on Cloud Foundry to access endpoint, default=RESTRICTED|

#### 1.2.4.3 Http Access

When you want to expose the Info endpoint over an HTTP connection, you need to do the following in your application:

* Add reference to `Steeltoe.Management.Endpoint.Info` or `Steeltoe.Management.CloudFoundry`
* Optionally, configure the above settings as needed
* Optionally, add any custom `IInfoContributor`s to the service container
* Add the Info actuator to the service container
* Use the Info middleware to provide Http access

Note that the Info endpoint will become accessible via HTTP at the same host and port that the application is using. Also, the path to the endpoint by default will be `/info`, unless either the global or the info endpoints `path` setting has been changed.

If you do *not* want to expose ALL of the Steeltoe endpoints using HTTP on Cloud Foundry then simply add the following `PackageReference` to your `.csproj` file.

If you intended to expose all of the Steeltoe endpoints (e.g. info, health, trace, etc.) then see the [Cloud Foundry](#1-2-7-cloud-foundry) section below, as you'll reference `Steeltoe.Management.CloudFoundry` instead.

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.Endpoint.Info" Version= "1.1.0"/>
...
</ItemGroup>
```

Then to add the Info actuator and any custom `IInfoContributor`s to the service container, you can use any one of the `AddInfoActuator()` extension methods from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Info/EndpointServiceCollectionExtensions.cs).

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `AddCloudFoundryActuators()` instead of specifically adding Info to the service container.

If you do end up using `AddCloudFoundryActuators()` then if you need to add custom `IInfoContributor`s to the service container you should simply add the `IInfoContributor`s to the service container as singleton.

Here is an example:

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

Then the last thing you need to do is to add the Info actuator middleware to the ASP.NET Core pipeline. You can use the `UseInfoActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Info/EndpointApplicationBuilderExtensions.cs) to do this.

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `UseCloudFoundryActuators()` instead of specifically adding Info to the pipeline.

### 1.2.5 Loggers

The Steeltoe Loggers management endpoint includes the ability to view and configure the logging levels of your application at runtime when using the [Steeltoe Logging provider](https://github.com/SteeltoeOSS/Logging).

You can view either the entire list or an individual logger’s configuration which is made up of both the explicitly configured logging level as well as the effective logging level given to it by the logging framework.

#### 1.2.5.1 Settings

Below are the settings that you can apply to the Loggers endpoint.  Each setting should be prefixed with `management:endpoints:loggers`

|Key|Description|
|------|------|
|**id**|The ID of the loggers endpoint, defaults = `info`|
|**enabled**|Enable or disable loggers management endpoint, defaults = true|
|**path**|Path to the loggers endpoint when exposed using HTTP, defaults = ID|
|**sensitive**|Currently not used, defaults = false|
|**requiredPermissions**|User permissions required on Cloud Foundry to access endpoint, default=RESTRICTED|

#### 1.2.5.2 Http Access

When you want to expose the Loggers endpoint over an HTTP connection, you need to do the following in your application:

* Add reference to `Steeltoe.Management.Endpoint.Loggers` or `Steeltoe.Management.CloudFoundry`
* Optionally, configure the above settings as needed
* Add the Steeltoe Logging provider to the ILoggerFactory
* Add the Logger actuator to the service container
* Use the Logger middleware to provide Http access

Note that the Loggers endpoint will become accessible via HTTP at the same host and port that the application is using. Also, the path to the endpoint by default will be `/loggers`, unless either the global or the info endpoints `path` setting has been changed.

If you do *not* want to expose ALL of the Steeltoe endpoints using HTTP on Cloud Foundry then simply add the following `PackageReference` to your `.csproj` file.

If you intended to expose all of the Steeltoe endpoints (e.g. info, health, trace, etc.) then see the [Cloud Foundry](#1-2-7-cloud-foundry) section below, as you'll reference `Steeltoe.Management.CloudFoundry` instead.

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.Endpoint.Loggers" Version= "1.1.0"/>
...
</ItemGroup>
```

Next, you need to add the [Steeltoe Logging provider](https://github.com/SteeltoeOSS/Logging) to the `ILoggerFactory`. This is normally done in the `Startup` class constructor as shown below.

Note that this logging provider is simply a wrapper around the [Microsoft Console Logging](https://github.com/aspnet/Logging) provider currently provided by Microsoft. This wrapper allows for querying the currently defined loggers and their levels as well as then modifying the levels dynamically at runtime. For more information see the documentation Steeltoe Logging documentation.

```csharp
using Steeltoe.Extensions.Logging.CloudFoundry;
public class Startup
{
    public Startup(IHostingEnvironment env, ILoggerFactory loggerFactory)
    {

        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
            .AddCloudFoundry()
            .AddEnvironmentVariables();
        Configuration = builder.Build();

        // Add Steeltoe Logging provider (Console logger)
        loggerFactory.AddCloudFoundry(Configuration.GetSection("Logging"));
    }
    ...
}
```

Then to add the Loggers actuator to the service container, you can use the `AddLoggersActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Loggers/EndpointServiceCollectionExtensions.cs).

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `AddCloudFoundryActuators()` instead of specifically adding Loggers to the service container.

Then the last thing you need to do is to add the Loggers actuator middleware to the ASP.NET Core pipeline. You can use the `UseLoggersActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Loggers/EndpointApplicationBuilderExtensions.cs) to do this.

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `UseCloudFoundryActuators()` instead of specifically adding Loggers to the pipeline.

### 1.2.6 Tracing

The Steeltoe Tracing endpoint includes the ability to view the last several requests made of your application. When you enable the Tracing endpoint, a [ITraceRepository](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Trace/ITraceRepository.cs) is configured and created to hold [Trace](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint/Trace/Trace.cs) information that can be retrieved using the endpoint.

When the Tracing endpoint is used on an ASP.NET Core application, a [TraceObserver](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Trace/TraceObserver.cs) is used to gather details from each incoming HTTP request.  The details that are gathered can be configured using the settings outlined below.

#### 1.2.6.1 Settings

Below are the settings that you can apply to the Trace endpoint.  Each setting should be prefixed with `management:endpoints:trace`

|Key|Description|
|------|------|
|**id**|The ID of the trace endpoint, defaults = `info`|
|**enabled**|Enable or disable trace management endpoint, defaults = true|
|**path**|Path to the trace endpoint when exposed using HTTP, defaults = ID|
|**sensitive**|Currently not used, defaults = false|
|**capacity**|User permissions required on Cloud Foundry to access endpoint, default=RESTRICTED|
|**addRequestHeaders**|Add in request headers, default=true|
|**addResponseHeaders**|Add in response headers, default=true|
|**addPathInfo**|Add in path information, default=false|
|**addUserPrincipal**|Add user principal, default=false|
|**addParameters**|Add request parameters, default=false|
|**addQueryString**|Add query string, default=false|
|**addAuthType**|Add authentication type, default=false|
|**addRemoteAddress**|Add remote address of user, default=false|
|**addSessionId**|Add in session id, default=false|
|**addTimeTaken**|Add in time take, default=true|

#### 1.2.6.2 Http Access

When you want to expose the Tracing endpoint over an HTTP connection, you need to do the following in your application:

* Add reference to `Steeltoe.Management.Endpoint.Trace` or `Steeltoe.Management.CloudFoundry`
* Optionally, configure the above settings as needed
* Add the Tracing actuator to the service container
* Use the Tracing middleware to provide Http access

Note that the Trace endpoint will become accessible via HTTP at the same host and port that the application is using. Also, the path to the endpoint by default will be `/trace`, unless either the global or the trace endpoints `path` setting has been changed.

If you do *not* want to expose ALL of the Steeltoe endpoints using HTTP on Cloud Foundry then simply add the following `PackageReference` to your `.csproj` file.

If you intended to expose all of the Steeltoe endpoints (e.g. info, health, trace, etc.) then see the [Cloud Foundry](#1-2-7-cloud-foundry) section below, as you'll reference `Steeltoe.Management.CloudFoundry` instead.

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.Endpoint.Trace" Version= "1.1.0"/>
...
</ItemGroup>
```

Then to add the Trace actuator to the service container, you can use the `AddTraceActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Trace/EndpointServiceCollectionExtensions.cs).

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `AddCloudFoundryActuators()` instead of specifically adding Trace to the service container.

Then the last thing you need to do is to add the Loggers actuator middleware to the ASP.NET Core pipeline. You can use the `UseTraceActuator()` extension method from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.Trace/EndpointApplicationBuilderExtensions.cs) to do this.

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will see in the [Cloud Foundry](#1-2-7-cloud-foundry) section below, that you will use `UseCloudFoundryActuators()` instead of specifically adding Loggers to the pipeline.

### 1.2.7 Cloud Foundry

 When used, the Steeltoe Cloud Foundry management endpoint enables the following additional functionality on Cloud Foundry:

* Exposes an endpoint which can be queried to return the Ids and links to all of the enabled management endpoints in the application.
* Adds Cloud Foundry security middleware to the request pipeline which secures access to the management endpoints using security tokens acquired from the UAA.
* Adds extension methods which simplify adding all of the Steeltoe management endpoints with HTTP access to the application.

The path that you enable for querying enabled management endpoints must be configured in your settings. When you want to integrate with the [Pivotal Cloud Foundry Apps Manager](https://docs.pivotal.io/pivotalcf/1-11/console/index.html) you should configure that to be `/cloudfoundryapplication`. See the section on settings below for details.

The [Cloud Foundry Security Middleware](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.CloudFoundry/CloudFoundrySecurityMiddleware.cs) added to the request processing pipeline enforces that when a request is made of any of the management endpoints in the app a valid UAA access token is provided as part of that request. Additionally, the token is used to determine whether the authenticated user has the permissions needed in order to access the management endpoint.  If not, the request is rejected and un-processed.

#### 1.2.7.1 Settings

When you want to integrate with the [Pivotal Cloud Foundry Apps Manager](https://docs.pivotal.io/pivotalcf/1-11/console/index.html) you need to configure the global management path prefix, as described in the [Endpoint Settings](#1-2-2-settings) section above, to be `/cloudfoundryapplication`. Simply add to your configuration: `management:endpoints:path=/cloudfoundryapplication`

Typically you will not need to do any additional configuration, but below are the additional settings that you could apply to the Cloud Foundry endpoint.  Each setting should be prefixed with `management:endpoints:cloudfoundry`

|Key|Description|
|------|------|
|**id**|The ID of the trace endpoint, defaults = `info`|
|**enabled**|Enable or disable trace management endpoint, defaults = true|
|**path**|Path to the trace endpoint when exposed using HTTP, defaults = ""|
|**sensitive**|Currently not used, defaults = false|
|**validateCertificates**|Validate server certificates, default=true|
|**applicationId**|The ID of the application used in permissions check, default=VCAP settings|
|**cloudFoundryApi**|The URL of the Cloud Foundry API, default=VCAP settings|

#### 1.2.7.2 Http Access

When you want to expose the Cloud Foundry endpoint over an HTTP connection, you need to do the following in your application:

* Add reference to `Steeltoe.Management.Endpoint.CloudFoundry` or `Steeltoe.Management.CloudFoundry`
* Optionally, configure the above settings as needed
* Add the Tracing actuator to the service container
* Use the Tracing middleware to provide Http access

Note that the Trace endpoint will become accessible via HTTP at the same host and port that the application is using. Also, the path to the endpoint by default will be `/`, unless either the global or the trace endpoints `path` setting has been changed.

If you do *not* want to expose ALL of the Steeltoe endpoints using HTTP on Cloud Foundry then simply add the following `PackageReference` to your `.csproj` file.

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.Endpoint.CloudFoundry" Version= "1.1.0"/>
...
</ItemGroup>
```

If you intended to expose all of the Steeltoe endpoints (e.g. info, health, trace, etc.) then simply add the following `PackageReference` to your `.csproj` file.

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Management.CloudFoundry" Version= "1.1.0"/>
...
</ItemGroup>
```

Then to add the CloudFoundry actuator to the service container, you can use the `AddCloudFoundryActuator()` extension method from [EndpointServiceCollectionExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.CloudFoundry/EndpointServiceCollectionExtensions.cs).

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then instead you should use `AddCloudFoundryActuators()` instead of the above.

Then the last thing you need to do is to add the Cloud Foundry actuator and security middleware to the ASP.NET Core pipeline. You can use the `UseCloudFoundryActuator()` and `UseCloudFoundrySecurity` extension methods from [EndpointApplicationBuilderExtensions](https://github.com/SteeltoeOSS/Management/blob/master/src/Steeltoe.Management.Endpoint.CloudFoundry/EndpointApplicationBuilderExtensions.cs) to do this.

If your plan is to expose all of the Steeltoe endpoints over HTTP on Cloud Foundry, then you will use `UseCloudFoundryActuators()` instead of the above.