---
title: Logging
order: 80
date: 2016/4/1
tags:
---

Steeltoe adds a Logging provider to the set of available logging packages in order to support the Steeltoe Management Logger endpoint.

This package when used with the Steeltoe Logger Management endpoint enables changing the logging levels for running applications dynamically using the Pivotal Application Manager Console on Cloud Foundry.

# 1.0 Cloud Foundry Provider

This logging provider is simply a wrapper around the [Microsoft Console Logging](https://github.com/aspnet/Logging) provider currently provided by Microsoft. This wrapper allows for querying the currently defined loggers and their levels as well as then modifying the levels dynamically at runtime.

For more information on how to use Pivotal Application Manager Console on Cloud Foundry for viewing and modifying logging levels, see the Pivotal documentation on [Managing Log Levels](https://docs.pivotal.io/pivotalcf/1-11/console/using-actuators.html)

The source code for the Logging provider can be found [here](https://github.com/SteeltoeOSS/Logging).

## 1.1 Usage

You should have a good understanding of how the .NET [Logging service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging) works before starting to use Steeltoe provider as its nothing more than a wrapper around the existing Microsoft logging solution. A basic understanding of the `ILoggerFactory` and how to add providers to the factory is necessary in order to configure the provider.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services and the middleware used in the app.

In order to use the Steeltoe logging provider you need to do the following:

* Add Logging Nuget package references to your project.
* Configure Logging settings.
* Add the CloudFoundry logging provider to the LoggerFactory.

### 1.1.1 Add NuGet References

To make use of the logging provider, you need to add a reference to the Steeltoe CloudFoundry Logging NuGet.

The provider is found in the `Steeltoe.Extensions.Logging.CloudFoundry` package.

Add the provider to your project using the following `PackageReference`:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Extensions.Logging.CloudFoundry" Version= "1.1.0"/>
...
</ItemGroup>
```

### 1.1.2 Configure Settings

As mentioned earlier, the Steeltoe Logging provider is simply a wrapper around the Microsoft Console logging provider. As such, when it comes to configuring it, you can configure it the same way you do the Microsoft provider. For more details on how this is done, see the documentation section on [Console logging provider](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging?tabs=aspnetcore1x#console).

### 1.1.3 Add Logging Provider

In order to use the provider, you need to add it to the `ILoggerFactory` by using the `AddCloudFoundry()` extension method.

In an ASP.NET Core application you would normally see this done in the `Startup` class, probably in the constructor with code like the following:

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
            .AddEnvironmentVariables();
        Configuration = builder.Build();

        loggerFactory.AddCloudFoundry(Configuration.GetSection("Logging"));
    }
```
