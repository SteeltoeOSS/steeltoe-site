---
title: Configuration 
order: 20
date: 2016/5/1
tags:
---

Steeltoe Configuration builds upon the new .NET configuration API, which enables developers to configure an application with values from a variety of sources using Configuration Providers. Each provider supports reading a set of name-value pairs from a given source location, adding them into a combined multi-level configuration dictionary.

Each value contained in the configuration is tied to a string-typed key or name. The values are organized by key into a hierarchical list of name-value pairs in which the components of the keys are separated by a colon (e.g. spring:application:key = value).

Out of the box, .NET supports the following providers/sources:

* Command-line arguments
* File sources (e.g. JSON, XML and INI)
* Environment variables
* Custom providers

To gain a better understanding of .NET configuration services you are encouraged to read the [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) documentation. Note that while the documentation link suggests this service is tied to ASP.NET Core, you will find that it is not, and in fact can be used in many different application types, including Console, ASP.NET 4.x., UWP, etc.

Steeltoe adds two additional configuration providers to the above list:

* Cloud Foundry
* Spring Cloud Config Server

The following sections go into more more detail on each of these new providers.

# 1.0 Cloud Foundry Provider

The Cloud Foundry provider enables the standard Cloud Foundry environment variables, `VCAP_APPLICATION`,  `VCAP_SERVICES` and `CF_*` to be parsed and accessed as configuration data within a .NET application.

These environment variables are created and used by Cloud Foundry to communicate an application's environment and configuration to the application code running inside a container. More specifically, the values found in `VCAP_APPLICATION` provide information about the application's resource limits, routes (i.e URIs), and version number among other things. The environment variable `VCAP_SERVICES` provides information about what external services (e.g. Databases, Caches, etc.) the application is bound to, along with details on how to contact those services.

You can read more information on the Cloud Foundry environment variables at the [Cloud Foundry docs](http://docs.cloudfoundry.org/devguide/deploy-apps/environment-variable.html) website.

The Steeltoe CloudFoundry provider supports the following .NET application types:

* ASP.NET - MVC, WebForms, WebAPI, WCF
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

 The source code for this provider can be found [here](https://github.com/SteeltoeOSS/Configuration).

## 1.1 Quick Start

This quick start illustrates how to make use of the Cloud Foundry configuration provider in an ASP.NET Core MVC application on Cloud Foundry.

You will need access to a Cloud Foundry runtime environment in order to complete the quick start.

### 1.1.1 Get Sample

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Configuration/src/AspDotNetCore/CloudFoundry
```

### 1.1.2 Publish Sample

Use the `dotnet` CLI to build and publish the application.

Note: below we show how to publish for all of the target run-times and frameworks the sample supports.  In order to proceed, choose the appropriate combination for your situation.

```bash
> # Restore all dependencies
> dotnet restore --configfile nuget.config
>
> # Build and publish for Linux, .NET Core
> dotnet publish -f netcoreapp2.0 -r ubuntu.14.04-x64
>
> # Build and publish for Windows, .NET Core
> dotnet publish -f netcoreapp2.0 -r win10-x64
>
> # Build and publish for Windows, .NET Framework
> dotnet publish -f net461 -r win10-x64
```

### 1.1.3 Push Sample

Use the Cloud Foundry CLI to target your Cloud Foundry Org and Space. (Replace "myorg" and "myspace" below with the actual names of your org and space.) Then push the published application to Cloud Foundry.

```bash
> cf target -o myorg -s myspace
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

### 1.1.4 Observe Logs

To monitor the logs as you start the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs cloud`)

On a Linux cell, you should see something like this during startup. On a Windows cell you will see something slightly different.

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

### 1.1.5 What to expect

Use the menu at the top of the sample application to see the various outputs produced by the provider.  Specifically click on the `CloudFoundry Settings` menu item and you should see `VCAP_APPLICATION` and `VCAP_SERVICES` configuration data for the app.

You will notice that there is no `VCAP_SERVICES` information. This is due to the fact that you have not bound any Cloud Foundry services to the app.

To see service binding information, simply bind any service to the application and then restart it. You can follow the instructions on the [Cloud Foundry documentation](http://docs.cloudfoundry.org/devguide/services/application-binding.html) site for details on how to do this.

### 1.1.6 Understand Sample

The `CloudFoundry` quick start sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) and then modified to include the Steeltoe framework.

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

* `CloudFoundry.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry`
* `Program.cs` - Code was added to read the `--server.urls` command line option.
* `Startup.cs` - Code was added to the `ConfigurationBuilder` and the Options feature was also added to the service container.
* `HomeController.cs` - Code was added for Options injection into the Controller. Code was also added to display the Cloud Foundry configuration data.
* `CloudFoundryViewModel.cs` - Used to communicate config values to `CloudFoundry.cshtml`
* `CloudFoundry.cshtml` - The view used to display Cloud Foundry configuration values.

## 1.2 Usage

The following sections describe in more detail, how to make use of the Cloud Foundry configuration provider.

Its recommended that you have a good understanding of how the .NET [Configuration services](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use this provider. A basic understanding of the `ConfigurationBuilder` and how to add additional providers to the builder is necessary.

In order to use the Steeltoe Cloud Foundry provider you need to do the following:

* Add NuGet package reference to your project.
* Add the provider to the Configuration Builder.
* Configure Cloud Foundry options classes by binding configuration data to the classes.
* Inject and use the Cloud Foundry Options to access Cloud Foundry configuration data.

### 1.2.1 Add NuGet Reference

To make use of the provider, you need to add a reference to the Steeltoe Cloud Foundry NuGet.

The provider is found in the `Steeltoe.Extensions.Configuration.CloudFoundry` package.

Add the provider to your project using the following `PackageReference`:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Extensions.Configuration.CloudFoundry" Version= "1.1.0"/>
...
</ItemGroup>
```

### 1.2.2 Add Configuration Provider

In order to parse the Cloud Foundry environment variables and make them available in the application's configuration, you need to add the Cloud Foundry configuration provider to the `ConfigurationBuilder`.

In an ASP.NET Core application you would normally see this done in the `Startup` class constructor with code like the following:

```csharp
#using Steeltoe.Extensions.Configuration;
...

var builder = new ConfigurationBuilder()
    .SetBasePath(env.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
    .AddCloudFoundry();
Configuration = builder.Build();
...

```

### 1.2.3 Access Configuration Data

Upon completion of the `Build()` method call shown above, the values from the environment variables `VCAP_APPLICATION` and `VCAP_SERVICES` will have been added to the applications configuration data and become available under the keys prefixed with `vcap:application` and `vcap:services` respectively.

You can access the values from the `VCAP_APPLICATION` environment variable settings directly from the configuration as follows:

```csharp
var config = builder.Build();
var appName = config["vcap:application:application_name"]
var instanceId = config["vcap:application:instance_id"]
....
```

A list of all `VCAP_APPLICATION` keys is available in the [VCAP_APPLICATION](http://docs.CloudFoundry.org/devguide/deploy-apps/environment-variable.html#VCAP-APPLICATION) topic of the Cloud Foundry documentation.

You can also access the values from the `VCAP_SERVICES` environment variable directly as well. For example, to access the information about the first instance of a bound Cloud Foundry service with the name `service-name` you would code the following:

```csharp
var config = builder.Build();
var name = config["vcap:services:service-name:0:name"]
var uri = config["vcap:services:service-name:0:credentials:uri"]
....
```

A list of all `VCAP_SERVICES` keys is available in the [VCAP_SERVICES](http://docs.CloudFoundry.org/devguide/deploy-apps/environment-variable.html#VCAP-SERVICES) topic of the Cloud Foundry documentation.

Note: This provider uses the built-in .NET [JSON Configuration Parser](https://github.com/aspnet/Configuration/tree/dev/src/Microsoft.Extensions.Configuration.Json) when parsing the JSON provided in the `VCAP_*` environment variables. As a result, you can expect the exact same key names and behavior as you see when parsing JSON configuration files (e.g. appsettings.json) in your application.

### 1.2.4 Access Configuration Data as Options

Alternatively, instead of accessing the Cloud Foundry configuration data directly from the configuration, you can also make use of the .NET [Options](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) framework together with [Dependency Injection](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection).

The Cloud Foundry provider includes two additional classes, `CloudFoundryApplicationOptions` and `CloudFoundryServicesOptions`. Both can be configured using the Options framework to hold the parsed `VCAP_*` data by making use of the Options `Configure()` feature.

To make use of it in an ASP.NET Core application, add the the following to the `ConfigureServices()` method in the `Startup` class.

```csharp
#using Steeltoe.Extensions.Configuration.CloudFoundry;

public void ConfigureServices(IServiceCollection services)
{
    // Setup Options framework with DI
    services.AddOptions();

    // Configure IOptions<CloudFoundryApplicationOptions> & IOptions<CloudFoundryServicesOptions>
    services.Configure<CloudFoundryApplicationOptions>(Configuration);
    services.Configure<CloudFoundryServicesOptions>(Configuration);
}
```

The `Configure<CloudFoundryApplicationOptions>(Configuration)` method call uses the Options framework to bind the `vcap:application` configuration values to an instance of `CloudFoundryApplicationOptions`.

The `Configure<CloudFoundryServicesOptions>(Configuration)` does the same, but binds the `vcap:services` values to an instance of `CloudFoundryServicesOptions`.

Both of these method calls also add these objects to the service container as `IOptions`.

Once this is done you can access these configuration objects in the Controllers or Views of an application using normal Dependency Injection.

Here is an example controller that illustrates how to do this:

```csharp
#using Steeltoe.Extensions.Configuration.CloudFoundry;

public class HomeController : Controller
{
    public HomeController(IOptions<CloudFoundryApplicationOptions> appOptions,
                            IOptions<CloudFoundryServicesOptions> serviceOptions )
    {
        AppOptions = appOptions.Value;
        ServiceOptions = serviceOptions.Value;
    }

    CloudFoundryApplicationOptions AppOptions { get; private set; }
    CloudFoundryServicesOptions ServiceOptions { get; private set; }

    // GET: /<controller>/
    public IActionResult Index()
    {
        ViewData["AppName"] = AppOptions.ApplicationName;
        ViewData["AppId"] = AppOptions.ApplicationId;
        ViewData["URI-0"] = AppOptions.ApplicationUris[0];

        ViewData[ServiceOptions.Services[0].Label] = ServiceOptions.Services[0].Name;
        ViewData["client_id"]= ServiceOptions.Services[0].Credentials["client_id"].Value;
        ViewData["client_secret"]= ServiceOptions.Services[0].Credentials["client_secret"].Value;
        ViewData["uri"]= ServiceOptions.Services[0].Credentials["uri"].Value;
        return View();
    }
}
```

# 2.0 Config Server Provider

This provider enables the Spring Cloud Config Server to be used as a source of configuration data for a .NET application.

The Spring Cloud Config Server is an application configuration service, which gives you a central place to manage an applications configuration values externally across all environments. As an application moves through the deployment pipeline from development to test and into production, you can use the config server to manage the configuration between environments and be certain that the application has everything it needs to run when you migrate it. The config server easily supports labelled versions of environment-specific configurations and is accessible to a wide range of tooling for managing its content.

To gain a better understanding of the Spring Cloud Config Server, you are encouraged to read the [Spring Cloud](http://projects.spring.io/spring-cloud/) documentation.

The Steeltoe Config Server provider supports the following .NET application types:

* ASP.NET - MVC, WebForm, WebAPI, WCF
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

In addition to the Quick Start below, there are several other Steeltoe sample applications that you can refer to when needing help in understanding how to make use of this provider:

* [AspDotNetCore/Simple](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNetCore/Simple) - ASP.NET Core sample app illustrating how to use the open source Config Server.
* [AspDotNet4/Simple](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNet4/Simple) - same as AspDotNetCore/Simple but built for ASP.NET 4.x
* [AspDotNet4/SimpleCloudFoundry](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNet4/SimpleCloudFoundry) - same as the Quick Start sample used below, but built for ASP.NET 4.x.
* [AspDotNet4/AutofacCloudFoundry](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNet4/AutofacCloudFoundry) - same as AspDotNet4/SimpleCloudFoundry, but built using the Autofac IOC container.
* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) -  a sample app illustrating how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.
* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ) - a polyglot (i.e. Java and .NET) micro-services based sample app illustrating inter-operability between Java and .NET based micro-services running on CloudFoundry, and secured with OAuth2 Security Services and using Spring Cloud Services.

The source code for this provider can be found [here](https://github.com/SteeltoeOSS/Configuration).

## 2.1 Quick Start

This quick start makes use of an ASP.NET Core application to illustrate how to use the Steeltoe Config Server provider to fetch configuration data from a Config Server running locally on your development machine and also how to take that same application and push it to Cloud Foundry and make use of a config server operating there.

### 2.1.1  Start Config Server Locally

In this step, we will fetch a repository from which we can start up a Spring Cloud Config Server locally on your desktop. This particular server has been pre-configured to fetch its configuration data from <https://github.com/steeltoeoss/config-repo>.

Make a note that you can use this same repository for your own future development work. In so doing, at some point you will want to change the location from which the server fetches its configuration data.

To do that you must modify `configserver/src/main/resources/application.yml` to point to a new github repository.  Once done, you will then need to run `mvnw clean` followed by `mvnw spring-boot:run` to make sure your server picks up the changes.

```bash
> git clone https://github.com/SteeltoeOSS/configserver.git
> cd configserver
> mvnw spring-boot:run
```

### 2.1.2 Get Sample

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Configuration/src/AspDotNetCore/SimpleCloudFoundry
```

### 2.1.3 Run Sample

Use the dotnet CLI to run the application. Note below we show how to run the app on both frameworks the sample supports. Just pick one in order to proceed.

```bash
> dotnet restore --configfile nuget.config
>
> # Run on .NET Core
> dotnet run -f netcoreapp2.0
>
> # Run on .NET Framework on Windows
> dotnet run -f net461
```

### 2.1.4 Observe Logs

When you startup the application, you should see something like the following:

```bash
> dotnet run -f netcoreapp2.0
Hosting environment: Production
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

### 2.1.5 What to expect

Fire up a browser and hit <http://localhost:5000>.  Use the menu presented by the app to see various output:

* `Config Server Settings` - should show the settings used by the Steeltoe client when communicating to the config server.  These have been picked up from settings in `appsettings.json`.
* `Config Server Data` - this is the configuration data returned from the config server's github repository. It will be some of the data from `foo.properties`, `foo-Production.properties` and `application.yml` if found in the github repository <https://github.com/steeltoeoss/config-repo>.
* `Reload` - will cause a reload of the configuration data from the server.

Change the Hosting environment variable setting to `development` (i.e. `export ASPNETCORE_ENVIRONMENT=development` or  `SET ASPNETCORE_ENVIRONMENT=development`), then restart the application.

You will see different configuration data returned for that profile/hosting environment.  This time it will be some of the data from `foo.properties`, `foo-development.properties` and `application.yml` if found in the github repository <https://github.com/steeltoeoss/config-repo>.

### 2.1.6 Start Config Server Cloud Foundry

In this step we will use the Cloud Foundry CLI to create a service instance of the Spring Cloud Config Server on Cloud Foundry. You will find in the `config-server.json` file that we have set the config server's github repository to: `https://github.com/spring-cloud-samples/config-repo`.

```bash
> # Target an org and space on Cloud Foundry
> cf target -o myorg -s development
>
> # Make sure you're in samples directory
> cd Samples/Configuration/src/AspDotNetCore/SimpleCloudFoundry
>
> # Create a Config Server instance on Cloud Foundry, use config-server.json settings
> cf create-service p-config-server standard myConfigServer -c ./config-server.json
>
> # Wait for the service to become ready
> cf services
```

The above creates on Cloud Foundry a Spring Cloud Config Server instance named `myConfigServer` configured from the contents of the file `config-server.json`.

### 2.1.7 Publish Sample

Use the `dotnet` CLI to build and publish the application.

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

### 2.1.8 Push Sample

Use the Cloud Foundry CLI to target and push the published application to Cloud Foundry.

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

Note that the manifests have been defined to bind the application to `myConfigServer` created above.

### 2.1.9 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs foo`)

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

### 2.1.10 What to expect

The `cf push` will create an app by the name `foo` and will bind the `myConfigServer` service instance to the app. You can hit the app at `http://foo.x.y.z/`.

Use the menu provided by the app to see various output related to Cloud Foundry and the config server:

* `CloudFoundry Settings` - should show `VCAP_APPLICATION` and `VCAP_SERVICES` settings read as configuration data.
* `Config Server Settings` - should show the settings used by the Steeltoe client when communicating to the Config Server.  These have been picked up from the service binding.
* `Config Server Data` - this is the configuration data returned from the Config Servers configured github repository. It will be some of the data from `foo.properties`, `foo-development.properties` and `application.yml` found in the github repository (<https://github.com/spring-cloud-samples/config-repo>).
* `Reload` - will cause a reload of the configuration data from the Config Server.

Change the Hosting environment setting to `production` (i.e. `export ASPNETCORE_ENVIRONMENT=production` or  `SET ASPNETCORE_ENVIRONMENT=production` ), and then re-push the application. You will see different configuration data returned for that profile/hosting environment.

### 2.1.11 Understand Sample

The `SimpleCloudFoundry` sample was created from the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) and then modified to add the Steeltoe framework.

To gain an understanding of the Steeltoe related changes to generated template code,  examine the following files:

* `SimpleCloudFoundry.csproj` - Contains `PackageReference` for Steeltoe NuGet `Pivotal.Extensions.Configuration.ConfigServer`
* `Program.cs` - Code added to read the ``--server.urls`` command line.
* `appsettings.json` - Contains configuration data needed for the Steeltoe Config Server provider.
* `ConfigServerData.cs` - Object used to hold the data retrieved from the config server
* `Startup.cs` - Code added to the `ConfigurationBuilder` and `ConfigServerData` Options added to the service container.
* `HomeController.cs` - Code added for `ConfigServerData` Options injected into the controller and ultimately used to display the data returned from config server.
* `ConfigServer.cshtml` - The view used to display the data returned from the config server.

## 2.2 Usage

The following sections describe how to make use of the config server configuration provider. You should have a good understanding of how the new .NET [Configuration services](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use this provider. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary.

You should also have a good understanding of the [Spring Cloud Config Server](http://cloud.spring.io/spring-cloud-config/).

 In order to use the Steeltoe provider you need to do the following:

* Add appropriate NuGet package reference to your project.
* Configure the settings the Steeltoe provider will use to access the Spring Cloud Config Server.
* Add the provider to the configuration builder.
* Optionally, configure the returned config server config data as Options.
* Inject and use Options or ConfigurationRoot to access configuration data.

### 2.2.1 Add NuGet Reference

There are two config server NuGets that you can choose from depending on your needs.

If you plan on only connecting to the open source version of [Spring Cloud Config Server](http://cloud.spring.io/spring-cloud-config/), then you should use the `Steeltoe.Extensions.Configuration.ConfigServer` package.

In this case add the provider to your project using the following `PackageReference`:

```xml
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Extensions.Configuration.ConfigServer" Version= "1.1.0"/>
...
</ItemGroup>
```

If you plan on connecting to the open source version of [Spring Cloud Config Server](http://cloud.spring.io/spring-cloud-config/), AND you plan on pushing your application to Cloud Foundry to make use of [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-4/common/index.html), then you should use the `Pivotal.Extensions.Configuration.ConfigServer` package.

In this case add the provider to your project using the following `PackageReference`:

```xml
<ItemGroup>
....
    <PackageReference Include="Pivotal.Extensions.Configuration.ConfigServer" Version= "1.1.0"/>
...
</ItemGroup>
```

### 2.2.2 Configure Settings

The most convenient way to configure settings for the provider is to put them in a file and then use one of the other file based configuration providers to read them in.

Below is an example of some provider settings put in a JSON file. Only two settings are really necessary; the setting `spring:application:name` configures the "application name" to `foo`, and `spring:cloud:config:uri` configures the address of the config server.

Note that the configuration setting `spring:application:name` is also used by other Steeltoe frameworks in addition to the config server.

```json
{
  "spring": {
    "application": {
      "name": "foo"
    },
    "cloud": {
      "config": {
        "uri": "http://localhost:8888"
      }
    }
  }
  .....
}
```

Below is a table of all the settings which can be used to configure the behavior of the provider.

As illustrated above, all settings should start with `spring:cloud:config:`

|Key|Description|
|------|------|
|**name**|App name to request config for, defaults = `IHostingEnvironment.ApplicationName`|
|**enabled**|Enable or disable config server client, defaults = true|
|**uri**|Endpoint of config server, defaults = `http://localhost:8888`|
|**env**|Environment/profile used in server request, defaults = `IHostingEnvironment.EnvironmentName`|
|**validate_certificates**|Enable or disable certificate validation, default = true|
|**label**|Comma separated list of labels to request, default = none|
|**timeout**|Time to wait for response from server, in milliseconds, default = 6s|
|**username**|Username for basic authentication, default = none|
|**password**|Password for basic authentication, default = none|
|**failFast**|Enable or Disable failure at startup, default = false|
|**token**|Hashicorp Vault authentication token, default = none|
|**tokenTtl**|Hashicorp Vault token renewal TTL, setting valid on CloudFoundry only, default = 300000ms|
|**tokenRenewRate**|Hashicorp Vault token renewal rate, setting valid on CloudFoundry only, default = 60000ms|
|**retry:enabled**|Enable or Disable retry logic, default = false|
|**retry:maxAttempts**|Max retries if retry enabled, default = 6|
|**retry:initialInterval**|Starting interval, default = 1000ms|
|**retry:maxInterval**|Maximum retry interval, default = 2000ms|
|**retry:multiplier**|Retry interval multiplier, default = 1.1|

>If you are using self-signed certificates on Cloud Foundry, it is possible that you might run into SSL certificate validation issues when pushing an app. A quick way to work around this is to disable certificate validation until a proper solution can be put in place.

### 2.2.3 Add Configuration Provider

Once the provider's settings have been defined and put in a file (e.g. JSON file), the next step is to get them read in and made available to the provider.

In the C# example below, the provider's configuration settings from the above example would be put in the `appsettings.json` file included with the application.  Then, by using the .NET provided JSON configuration provider we are able to read the settings simply by just by adding the JSON provider to the configuration builder (e.g. `AddJsonFile("appsettings.json")`.

Then, after the JSON provider has been added, you can then add the config server provider to the builder, we include a (e.g. `AddConfigServer(env)`) passing in are reference to the `IHostEnvironment`.

Because the JSON provider that is reading `appsettings.json` has been added `before` the config server provider, the JSON based settings will become available to the Steeltoe provider.  Note that you don't have to use JSON for the Steeltoe settings; you can use any of the other off-the-shelf configuration providers for the settings (e.g. INI file, environment variables, etc.).

The important thing to understand is; you need to `Add*()` the source of the config server clients settings (i.e. `AddJsonFile(..)`) *before* you `AddConfigServer(..)`,  otherwise the settings won't be picked up and used.

```csharp
#using Steeltoe.Extensions.Configuration;
...

var builder = new ConfigurationBuilder()
    .SetBasePath(env.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddConfigServer(env)
    .AddEnvironmentVariables();

var config = builder.Build();
...
```

Normally in an ASP.NET Core application, the above C# code would be included in the constructor of the `Startup` class.

### 2.2.4 Cloud Foundry

When you want to use a config server on Cloud Foundry and you have installed Spring Cloud Services, you can create and bind an instance of it to your application using the Cloud Foundry CLI as follows:

```bash
> # Target an org and space on Cloud Foundry
> cf target -o myorg -s myspace
>
> # Create config server instance named `myConfigServer`
> cf create-service p-config-server standard myConfigServer
>
> # Wait for service to become ready
> cf services
>
> # Bind the service to `myApp`
> cf bind-service myApp myMySqlService
>
> # Restage the app to pick up change
> cf restage myApp
```

For more information on using the config server on Cloud Foundry, see the [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-4/common/) documentation.

Once you have the service bound to the application, the config server settings will become available and be setup in `VCAP_SERVICES`.

Then when you push the application, the Steeltoe provider will take the settings from the service binding and merge those settings with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`).

If there are any merge conflicts, then the service binding settings will take precedence and will override all others.

### 2.2.5 Access Configuration Data

Referencing the example code above, when the `Build()` method is called, the config server provider will make the appropriate REST call(s) to the config server and retrieve configuration values based on the settings that have been provided.

If there are any errors or problems accessing the config server, the application will continue to initialize, but the values from the server will not be retrieved.  If this is not the behavior you want, then you should set the `spring:cloud:config:failFast` to true. Once thats done, then the application will fail to start if problems occur during the `Build()`.

After the configuration has been built you can then access the retrieved data directly using the `IConfigurationRoot` returned from `Build()`.  Here is some sample code illustrating how this is done:

```csharp
....
var config = builder.Build();
var property1 = config["myconfiguration:property1"]
var property2 = config["myconfiguration:property2"]
....
```

Alternatively, you can create a class to hold your configuration data and then use the [Options](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) framework together with [Dependency Injection](http://docs.asp.net/en/latest/fundamentals/dependency-injection.html) to inject an instance of the class into your controllers and view.

To do this, first create the class representing the configuration data you expect to retrieve from the server. For example:

```csharp
public class MyConfiguration {
    public string Property1 { get; set; }
    public string Property2 { get; set; }
}
```

Next, use the `Configure<>()` method to tell the Options framework to create an instance of that class with the returned data.  For the above `MyConfiguration` class you would add the following code to the `ConfigureServices()` method in the `Startup` class.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Setup Options framework with DI
    services.AddOptions();

    // Configure IOptions<MyConfiguration>
    services.Configure<MyConfiguration>(Configuration.GetSection("myconfiguration"));
    ....
}
```

The above `Configure<MyConfiguration>(Configuration.GetSection("myconfiguration"))` method call instructs the Options framework to bind the `myconfiguration:...` values to an instance of the `MyConfiguration` class.

After this has been done, then you are able to gain access to the data in your `Controller` or `View` via dependency injection.  Here is an example controller illustrating how this is done:

```csharp

public class HomeController : Controller
{
    public HomeController(IOptions<MyConfiguration> myOptions)
    {
        MyOptions = myOptions.Value;
    }

    MyConfiguration MyOptions { get; private set; }

    // GET: /<controller>/
    public IActionResult Index()
    {
        ViewData["property1"] = MyOptions.Property1;
        ViewData["property2"] = MyOptions.Property2;
        return View();
    }
}
```

### 2.2.6 Enable Logging

Sometimes its desirable to turn on debug logging in the provider.

To do this, you need to inject the `ILoggerFactory` into the `Startup` class constructor by adding it as an argument to the constructor.  Once you have access to it, then you can add a console logger to the factory and also set its minimum logging level set to Debug.

Once thats done, then simply pass the `ILoggerFactory` to the Steeltoe configuration provider.  The provider will then use it to establish a logger with debug level logging turned on.

Here is some example code:

```csharp
public Startup(IHostingEnvironment env, ILoggerFactory logFactory)
{
    logFactory.AddConsole(minLevel: LogLevel.Debug);

    // Set up configuration sources.
    var builder = new ConfigurationBuilder()
        .SetBasePath(env.ContentRootPath)
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
        .AddEnvironmentVariables()
        .AddConfigServer(env, logFactory);
....

}
```
