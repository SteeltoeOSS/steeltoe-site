---
title: Logging
order: 80
date: 2016/4/1
tags:
---

Steeltoe adds a Logging provider to the set of available logging packages in order to support the Steeltoe Management Logger endpoint.

This package when used with the Steeltoe Logger Management endpoint enables changing the logging levels for running applications dynamically using the  [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) on Cloud Foundry.

# 1.0 Dynamic Logging Provider

This logging provider is simply a wrapper around the [Microsoft Console Logging](https://github.com/aspnet/Logging) provider currently provided by Microsoft. This wrapper allows for querying the currently defined loggers and their levels as well as then modifying the levels dynamically at runtime.

For more information on how to use [Pivotal Apps Manager](https://docs.pivotal.io/pivotalcf/2-0/console/index.html) on Cloud Foundry for viewing and modifying logging levels, see the [Using Actuators with Apps Manager section](https://docs.pivotal.io/pivotalcf/2-0/console/using-actuators.html) of the Pivotal Cloud Foundry documentation for more details.

The source code for the Logging provider can be found [here](https://github.com/SteeltoeOSS/Logging).

## 1.1 Usage

You should have a good understanding of how the .NET [Logging service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/?tabs=aspnetcore2x) works before starting to use Steeltoe provider as it is nothing more than a wrapper around the existing Microsoft Console logger.

In order to use the Steeltoe logging provider you need to do the following:

* Add the Logging NuGet package references to your project.
* Configure Logging settings.
* Add the Dynamic logging provider to the logging builder.

### 1.1.1 Add NuGet References

To make use of the logging provider, you need to add a reference to the Steeltoe Dynamic Logging NuGet.

The provider is found in the `Steeltoe.Extensions.Logging.DynamicLogger` package.

Add the provider to your project using the following `PackageReference`:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Extensions.Logging.DynamicLogger" Version= "2.0.0"/>
...
</ItemGroup>
```

### 1.1.2 Configure Settings

As mentioned earlier, the Steeltoe Logging provider is simply a wrapper around the Microsoft Console logging provider. As such, when it comes to configuring it, you can configure it the same way you do the Microsoft provider. For more details on how this is done, see the documentation section on [Log Filtering](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/?tabs=aspnetcore2x#log-filtering).

### 1.1.3 Add Logging Provider

In order to use the provider, you need to add it to the logging builder by using the `AddDynamicConsole()` extension method.

Here is an example:

```csharp
using Steeltoe.Extensions.Logging;
public class Program
{
    public static void Main(string[] args)
    {
        var host = new WebHostBuilder()
            .UseKestrel()
            .UseCloudFoundryHosting()
            .UseContentRoot(Directory.GetCurrentDirectory())
            .UseIISIntegration()
            .UseStartup<Startup>()
            .UseApplicationInsights()
            .ConfigureAppConfiguration((builderContext, config) =>
            {
                config.SetBasePath(builderContext.HostingEnvironment.ContentRootPath)
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .AddJsonFile($"appsettings.{builderContext.HostingEnvironment.EnvironmentName}.json", optional: true)
                    .AddCloudFoundry()
                    .AddEnvironmentVariables();
            })
            .ConfigureLogging((builderContext, loggingBuilder) =>
            {
                loggingBuilder.AddConfiguration(builderContext.Configuration.GetSection("Logging"));
                
                // Add Steeltoe Dynamic Logging provider
                loggingBuilder.AddDynamicConsole();
            })
            .Build();

        host.Run();
    }
}
```
