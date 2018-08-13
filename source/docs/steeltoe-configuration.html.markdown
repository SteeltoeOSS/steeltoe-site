---
title: Configuration
order: 20
date: 2016/5/1
tags:
---

Steeltoe Configuration builds on the new .NET configuration API, which enables developers to configure an application with values from a variety of sources by using Configuration Providers. Each provider supports reading a set of name-value pairs from a given source location and adding them into a combined multi-level configuration dictionary.

Each value contained in the configuration is tied to a string-typed key or name. The values are organized by key into a hierarchical list of name-value pairs in which the components of the keys are separated by a colon (for example, `spring:application:key = value`).

.NET supports the following providers/sources:

* Command-line arguments
* File sources (such as JSON, XML, and INI)
* Environment variables
* Custom providers

To better understand .NET configuration services, you should read the [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) documentation. Note that, while the documentation link suggests this service is tied to ASP.NET Core, it is not. It can be used in many different application types, including Console, ASP.NET 4.x., UWP, and others.

Steeltoe adds two additional configuration providers to the preceding list:

* Cloud Foundry
* Spring Cloud Config Server

The following sections provide more more detail on each of these new providers.

# 0.0 Initialize Dev Environment

All of the Steeltoe sample applications are in the same repository. If you have not already done so, use git to clone the [Steeltoe Samples](https://github.com/SteeltoeOSS/Samples) repository or download it with your browser from GitHub. The following git command shows how to clone the repository from the command line:

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
```

>NOTE: All Configuration samples in the Samples repository have a base path of `Samples/Configuration/src/`.

Make sure your Cloud Foundry CLI tools are logged in and targeting the correct org and space, as follows:

```bash
> cf login [-a API_URL] [-u USERNAME] [-p PASSWORD] [-o ORG] [-s SPACE] [--skip-ssl-validation]
```

or

```bash
> cf target -o <YourOrg> -s <YourSpace>
```

The Configuration sample requires a Config server. If you intend to run the samples locally, install the Java 8 JDK and Maven 3.x now.

# 1.0 Cloud Foundry Provider

<span style="display:inline-block;margin:0 20px;">For use with </span><span style="display:inline-block;vertical-align:top;width:40%"> ![alt text](/images/CFF_Logo_rgb.png "Cloud Foundry")</span>

The Cloud Foundry provider enables the standard Cloud Foundry environment variables (`VCAP_APPLICATION`,  `VCAP_SERVICES`, and `CF_*`) to be parsed and accessed as configuration data within a .NET application.

Cloud Foundry creates and uses these environment variables to communicate an application's environment and configuration to the application code running inside a container. More specifically, the values found in `VCAP_APPLICATION` provide information about the application's resource limits, routes (URIs), and version number, among other things. The `VCAP_SERVICES` environment variable provides information about the external services (Databases, Caches, and so on) to which the application is bound, along with details on how to contact those services.

You can read more information on the Cloud Foundry environment variables at the [Cloud Foundry docs](http://docs.cloudfoundry.org/devguide/deploy-apps/environment-variable.html) website.

The Steeltoe Cloud Foundry provider supports the following .NET application types:

* ASP.NET (MVC, WebForms, WebAPI, WCF)
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

 The source code for this provider can be found [here](https://github.com/SteeltoeOSS/Configuration).

## 1.1 Quick Start

This quick start shows how to use the Cloud Foundry configuration provider in an ASP.NET Core MVC application on Cloud Foundry.

You need access to a Cloud Foundry runtime environment in order to complete the quick start.

### 1.1.1 Locate Sample

First, you must navigate to the correct directory, as follows:

```bash
> cd Samples/Configuration/src/AspDotNetCore/CloudFoundry
```

### 1.1.2 Publish Sample

See [Publish Sample](#publish-sample) for how to publish this sample to either Linux or Windows.

### 1.1.3 Push Sample

See [Push Sample](#push-sample) for how to push this sample to either Linux or Windows on Cloud Foundry.

### 1.1.4 Observe Logs

To monitor the logs as you start the application, use the following command: `cf logs cloud`.

On a Linux cell, you should see resembling the following during startup:

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

On a Windows cell, you should see something slightly different but with the same information.

### 1.1.5 What to Expect

Use the menu at the top of the sample application to see the various outputs produced by the provider. Specifically, click on the `CloudFoundry Settings` menu item. You should see `VCAP_APPLICATION` and `VCAP_SERVICES` configuration data for the app.

Because you have not bound any Cloud Foundry services to the app, there is no `VCAP_SERVICES` information.

To see service binding information, bind any service to the application and then restart it. To do so, follow the instructions on the [Cloud Foundry documentation](http://docs.cloudfoundry.org/devguide/services/application-binding.html) site.

### 1.1.6 Understand Sample

The `CloudFoundry` quick start sample was created by using the .NET Core tooling `mvc` template (`dotnet new mvc`) and then modified to include the Steeltoe framework.

To gain an understanding of the Steeltoe related changes to the generated template code, examine the following files:

* `CloudFoundry.csproj`: Contains the `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry`
* `Program.cs`:  Code was added to the `ConfigurationBuilder` to pick up Cloud Foundry configuration values when pushed to Cloud Foundry and to use Cloud Foundry hosting.
* `Startup.cs`: Code was added to the `ConfigureCloudFoundryOptions`.
* `HomeController.cs`: Code was added for Options injection into the Controller. Code was also added to display the Cloud Foundry configuration data.
* `CloudFoundryViewModel.cs`: Used to communicate config values to `CloudFoundry.cshtml`.
* `CloudFoundry.cshtml`: The view used to display Cloud Foundry configuration values.

## 1.2 Usage

The following sections describe how to use the Cloud Foundry configuration provider:

* [Add NuGet Reference](#1-2-1-add-nuget-reference)
* [Add Configuration Provider](#1-2-2-add-configuration-provider)
* [Access Configuration Data](#1-2-3-access-configuration-data)
* [Access Configuration Data as Options](#1-2-4-access-configuration-data-as-options)

You should have a good understanding of how the .NET [Configuration services](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) work before starting to use this provider.

In order to use the Steeltoe Cloud Foundry provider you need to do the following:

1. Add a NuGet package reference to your project.
1. Add the provider to the Configuration Builder.
1. Configure Cloud Foundry options classes by binding configuration data to the classes.
1. Inject and use the Cloud Foundry Options to access Cloud Foundry configuration data.

>NOTE: Most of the example code in the following sections is based on using Steeltoe in an ASP.NET Core application. If you are developing an ASP.NET 4.x application or a Console based app, see the [other samples](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration) for example code you can use.

### 1.2.1 Add NuGet Reference

To use the provider, you need to add a reference to the appropriate Steeltoe Cloud Foundry NuGet based on the type of the application you are building and what Dependency Injector you have chosen, if any. The following table describes the available packages:

|App Type|Package|Description|
|---|---|---|
|Console/ASP.NET 4.x|`Steeltoe.Extensions.Configuration.CloudFoundryBase`|Base functionality. No dependency injection.|
|ASP.NET Core|`Steeltoe.Extensions.Configuration.CloudFoundryCore`|Includes base. Adds ASP.NET Core dependency injection.|
|ASP.NET 4.x with Autofac|`Steeltoe.Extensions.Configuration.CloudFoundryAutofac`|Includes base. Adds Autofac dependency injection.|

To add this type of NuGet to your project, add a `PackageReference` resembling the following:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.Extensions.Configuration.CloudFoundryCore" Version= "2.1.0"/>
...
</ItemGroup>
```

### 1.2.2 Add Configuration Provider

In order to parse the Cloud Foundry environment variables and make them available in the application's configuration, you need to add the Cloud Foundry configuration provider to the `ConfigurationBuilder`.

The following example shows how to do so:

```csharp
using Steeltoe.Extensions.Configuration;
...

var builder = new ConfigurationBuilder()
    .SetBasePath(env.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)

    // Add VCAP_* configuration data
    .AddCloudFoundry();
Configuration = builder.Build();
...

```

When developing an ASP.NET Core application, you can do the same thing by using the `AddCloudFoundry()` extension method on the `IWebHostBuilder`. The following example shows how to do so:

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        BuildWebHost(args).Run();
    }
    public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseCloudFoundryHosting()

            // Add VCAP_* configuration data
            .AddCloudFoundry()
            .UseStartup<Startup>()
            .Build();
}
```

### 1.2.3 Access Configuration Data

Once the configuration has been built, the values from the `VCAP_APPLICATION` and `VCAP_SERVICES` environment variables have been added to the application's configuration data and become available under keys prefixed with `vcap:application` and `vcap:services` respectively.

You can access the values from the `VCAP_APPLICATION` environment variable settings directly from the configuration as follows:

```csharp
var config = builder.Build();
var appName = config["vcap:application:application_name"]
var instanceId = config["vcap:application:instance_id"]
...
```

A list of all `VCAP_APPLICATION` keys is available in the [VCAP_APPLICATION](http://docs.CloudFoundry.org/devguide/deploy-apps/environment-variable.html#VCAP-APPLICATION) topic of the Cloud Foundry documentation.

You can also directly access the values from the `VCAP_SERVICES` environment variable. For example, to access the information about the first instance of a bound Cloud Foundry service with a name of `service-name`, you could code the following:

```csharp
var config = builder.Build();
var name = config["vcap:services:service-name:0:name"]
var uri = config["vcap:services:service-name:0:credentials:uri"]
...
```

A list of all `VCAP_SERVICES` keys is available in the [VCAP_SERVICES](http://docs.CloudFoundry.org/devguide/deploy-apps/environment-variable.html#VCAP-SERVICES) topic of the Cloud Foundry documentation.

Note: This provider uses the built-in .NET [JSON Configuration Parser](https://github.com/aspnet/Configuration/tree/dev/src/Microsoft.Extensions.Configuration.Json) when parsing the JSON provided in the `VCAP_*` environment variables. As a result, you can expect the exact same key names and behavior as you see when parsing JSON configuration files (such as `appsettings.json`) in your application.

### 1.2.4 Access Configuration Data as Options

Alternatively, instead of accessing the Cloud Foundry configuration data directly from the configuration, you can use the .NET [Options](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) framework together with [Dependency Injection](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection).

The Cloud Foundry provider includes two additional classes, `CloudFoundryApplicationOptions` and `CloudFoundryServicesOptions`. Both can be configured through the Options framework to hold the parsed `VCAP_*` data by using the Options `Configure()` feature.

To use it in an ASP.NET Core application, add the the following to the `ConfigureServices()` method in the `Startup` class:

```csharp
using Steeltoe.Extensions.Configuration.CloudFoundry;

public void ConfigureServices(IServiceCollection services)
{
    // Setup Options framework with DI
    services.AddOptions();

    // Add Steeltoe Cloud Foundry Options to service container
    services.ConfigureCloudFoundryOptions(Configuration);
}
```

The `ConfigureCloudFoundryOptions(Configuration)` method call uses the Options framework to bind the `vcap:application` configuration values to an instance of `CloudFoundryApplicationOptions` and binds the `vcap:services` values to an instance of `CloudFoundryServicesOptions`.

Both of these method calls also add these objects to the service container as `IOptions`.

Once this is done, you can access these configuration objects in the Controllers or Views of an application by using normal Dependency Injection.

The following example controller shows how to do so:

```csharp
using Steeltoe.Extensions.Configuration.CloudFoundry;

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

The Spring Cloud Config Server is an application configuration service that gives you a central place to manage an application's configuration values externally across all environments. As an application moves through the deployment pipeline from development to test and into production, you can use the config server to manage the configuration between environments and be certain that the application has everything it needs to run when you migrate it. The config server easily supports labelled versions of environment-specific configurations and is accessible to a wide range of tooling for managing its content.

To gain a better understanding of the Spring Cloud Config Server, you should read the [Spring Cloud](http://projects.spring.io/spring-cloud/) documentation.

The Steeltoe Config Server provider supports the following .NET application types:

* ASP.NET (MVC, WebForm, WebAPI, WCF)
* ASP.NET Core
* Console apps (.NET Framework and .NET Core)

In addition to the Quick Start below, there are several other Steeltoe sample applications that you can refer to when needing help in understanding how to use this provider:

* [AspDotNetCore/Simple](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNetCore/Simple): ASP.NET Core sample app showing how to use the open source Config Server.
* [AspDotNet4/Simple](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNet4/Simple): Same as AspDotNetCore/Simple but built for ASP.NET 4.x
* [AspDotNet4/SimpleCloudFoundry](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNet4/SimpleCloudFoundry): Same as the Quick Start sample mentioned later but built for ASP.NET 4.x.
* [AspDotNet4/AutofacCloudFoundry](https://github.com/SteeltoeOSS/Samples/tree/master/Configuration/src/AspDotNet4/AutofacCloudFoundry): Same as AspDotNet4/SimpleCloudFoundry but built using the Autofac IOC container.
* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore): A sample application showing how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.
* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ): A polyglot microservices-based sample app showing inter-operability between Java and .NET on Cloud Foundry. It is secured with OAuth2 Security Services and using Spring Cloud Services.

The source code for this provider can be found [here](https://github.com/SteeltoeOSS/Configuration).

## 2.1 Quick Start

This quick start uses an ASP.NET Core application to show how to use the Steeltoe Config Server provider to fetch configuration data from a Config Server running locally on your development machine and also how to take that same application and push it to Cloud Foundry and use a config server operating there.

### 2.1.1  Running Locally

The following sections describe how to use the Spring Cloud Config Server configuration provider when running locally:

* [Start Config Server](#2-1-1-1-start-config-server)
* [Locate Sample](#2-1-1-2-locate-sample)
* [Run Sample](#2-1-1-3-run-sample)
* [Observe Logs](#2-1-1-4-observe-logs)
* [View Results](#2-1-1-5-view-results)

#### 2.1.1.1 Start Config Server

In this step, we fetch a GitHub repository from which we can start up a Spring Cloud Config Server locally on the desktop. This particular server has been pre-configured to fetch its configuration data from <https://github.com/steeltoeoss/config-repo>.

You can use this same GitHub repository for your own future development work. If you do so, at some point, you will want to change the location from which the server fetches its configuration data. To do so, you must modify `configserver/src/main/resources/application.yml` to point to a new GitHub repository. Once that is done, you need to run `mvnw clean` followed by `mvnw spring-boot:run` to make sure your server picks up the changes, as shown in the following example:

```bash
> git clone https://github.com/SteeltoeOSS/configserver.git
> cd configserver
> mvnw spring-boot:run
```

#### 2.1.1.2 Locate Sample

To find the sample, change the current directory as follows:

```bash
> cd Samples/Configuration/src/AspDotNetCore/SimpleCloudFoundry
```

#### 2.1.1.3 Run Sample

You can use the dotnet CLI to run the application. To get started, run the following command:

```bash
> dotnet restore --configfile nuget.config
```

To run the application on .NET Core on Windows, Linux or OSX, use the following command:

```bash
> dotnet run -f netcoreapp2.1
```

To run the application on .NET Framework on Windows, use the following command:

```bash
> dotnet run -f net461
```

#### 2.1.1.4 Observe Logs

When you startup the application, you should see output similar to the following:

```bash
> dotnet run -f netcoreapp2.1
Hosting environment: Production
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

#### 2.1.1.5 View Results

Start a browser and visit <http://localhost:5000>. Use the menu presented by the app to see various output, as follows:

* `Config Server Settings`: Shows the settings used by the Steeltoe client when communicating to the config server. These come from settings in `appsettings.json`.
* `Config Server Data`: Shows the configuration data returned from the config server's github repository. It includes some of the data from `sample.properties`, `sample-Production.properties`, and `application.yml` if they are found in the GitHub repository: <https://github.com/steeltoeoss/config-repo>.
* `Reload`: Triggers a reload of the configuration data from the server.

Change the Hosting environment variable setting to `development` (by using `export ASPNETCORE_ENVIRONMENT=development` or `SET ASPNETCORE_ENVIRONMENT=development`) and then restart the application.

You should see different configuration data returned for that profile/hosting environment. This time, it contains some of the data from `sample.properties`, `sample-development.properties`, and `application.yml`, if they are found in the GitHub repository: <https://github.com/steeltoeoss/config-repo>.

### 2.1.2 Running on Cloud Foundry

The following sections describe how to use the Spring Cloud Config Server configuration provider on Cloud Foundry:

* [Start Config Server](#2-1-2-1-start-config-server)
* [Publish Sample](#2-1-2-2-publish-sample)
* [Push Sample](#2-1-2-3-push-sample)
* [Observe Logs](#2-1-2-4-observe-logs)
* [View Results](#2-1-2-5-view-results)

#### 2.1.2.1 Start Config Server

In this step, we use the Cloud Foundry CLI to create a service instance of the Spring Cloud Config Server on Cloud Foundry. In the `config-server.json` file, you can see that we have set the config server's github repository to `https://github.com/spring-cloud-samples/config-repo`. To do so, run the following commands:

```bash
> # Make sure you are in the samples directory
> cd Samples/Configuration/src/AspDotNetCore/SimpleCloudFoundry
>
> # Create a Config Server instance on Cloud Foundry, using config-server.json settings
> cf create-service p-config-server standard myConfigServer -c ./config-server.json
>
> # Wait for the service to become ready
> cf services
```

These commands create a Spring Cloud Config Server instance on Cloud Foundry named `myConfigServer` configured from the contents of the file `config-server.json`.

#### 2.1.2.2 Publish Sample

See [Publish Sample](#publish-sample) for instructions on how to publish this sample to either Linux or Windows.

#### 2.1.2.3 Push Sample

See [Push Sample](#push-sample) for instructions on how to push this sample to either Linux or Windows on Cloud Foundry.

#### 2.1.2.4 Observe Logs

To see the logs as you start the application, use `cf logs foo`.

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

On Windows cells, you should see something slightly different but with the same content.

#### 2.1.2.5 View Results

The `cf push` command creates an application by the name of `foo` and binds the `myConfigServer` service instance to the application. You can see the application at `http://sample.x.y.z/`.

Use the menu provided by the app to see various output related to Cloud Foundry and the config server:

* `CloudFoundry Settings`: Should show `VCAP_APPLICATION` and `VCAP_SERVICES` settings read as configuration data.
* `Config Server Settings`: Should show the settings used by the Steeltoe client when communicating to the Config Server. These have been picked up from the service binding.
* `Config Server Data`: This is the configuration data returned from the Config Server's configured GitHub repository. It includes some of the data from `foo.properties`, `foo-development.properties` and `application.yml` found in the GitHub repository: (<https://github.com/spring-cloud-samples/config-repo>).
* `Reload`: Triggers a reload of the configuration data from the Config Server.

Change the Hosting environment setting to `production` (by using `export ASPNETCORE_ENVIRONMENT=production` or  `SET ASPNETCORE_ENVIRONMENT=production` ) and then re-push the application. You should see different configuration data returned for that profile/hosting environment.

### 2.1.3 Understand Sample

The `SimpleCloudFoundry` sample was created from the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) and then modified to add the Steeltoe framework.

To gain an understanding of the Steeltoe related changes to generated template code, examine the following files:

* `SimpleCloudFoundry.csproj` - Contains `PackageReference` for Steeltoe NuGet `Pivotal.Extensions.Configuration.ConfigServer`
* `Program.cs` - Code was added to the `ConfigurationBuilder` in order to add Config Server configuration values to the configuration and to use Cloud Foundry hosting.
* `appsettings.json` - Contains configuration data needed for the Steeltoe Config Server provider.
* `ConfigServerData.cs` - Object used to hold the data retrieved from the config server
* `Startup.cs` - Code added to configure the `ConfigServerData` Options added to the service container.
* `HomeController.cs` - Code added for `ConfigServerData` Options injected into the controller and ultimately used to display the data returned from config server.
* `ConfigServer.cshtml` - The view used to display the data returned from the config server.

## 2.2 Usage

The following sections describe how to use the config server configuration provider.

* [Add NuGet Reference](#2-2-1-add-nuget-reference)
* [Configure Settings](#2-2-2-configure-settings)
* [Add Configuration Provider](#2-2-3-add-configuration-provider)
* [Bind to Cloud Foundry](#2-2-4-bind-to-cloud-foundry)
* [Access Configuration Data](#2-2-5-access-configuration-data)
* [Enable Logging](#2-2-6-enable-logging)

You should know how the new .NET [Configuration services](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) work before starting to use this provider. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary.

You should also have a good understanding of the [Spring Cloud Config Server](http://cloud.spring.io/spring-cloud-config/).

To use the Steeltoe provider, you need to do the following:

1. Add the appropriate NuGet package reference to your project.
1. Configure the settings that the Steeltoe provider uses to access the Spring Cloud Config Server.
1. Add the provider to the configuration builder.
1. Optionally, configure the returned config server config data as Options.
1. Inject and use Options or ConfigurationRoot to access configuration data.

### 2.2.1 Add NuGet Reference

You can choose from two Config Server client NuGets, depending on your needs.

If you plan on only connecting to the open source version of [Spring Cloud Config Server](http://projects.spring.io/spring-cloud/), then you should use one of the packages described by the following table, depending on your application type and needs:

|App Type|Package|Description|
|---|---|---|
|Console/ASP.NET 4.x|`Steeltoe.Extensions.Configuration.ConfigServerBase`|Base functionality. No dependency injection.|
|ASP.NET Core|`Steeltoe.Extensions.Configuration.ConfigServerCore`|Includes base. Adds ASP.NET Core dependency injection.|
|ASP.NET 4.x with Autofac|`Steeltoe.Extensions.Configuration.ConfigServerAutofac`|Includes base. Adds Autofac dependency injection.|

To add this type of NuGet to your project, add a `PackageReference` that resembles the following:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.Extensions.Configuration.ConfigServerCore" Version= "2.1.0"/>
...
</ItemGroup>
```

If you plan to connect to the open source version of [Spring Cloud Config Server](http://projects.spring.io/spring-cloud/) and you plan to push your application to Cloud Foundry to use [Spring Cloud Services](http://docs.pivotal.io/spring-cloud-services/1-5/common/index.html), you should use one of the packages described in the following table, depending on your application type and needs:

|App Type|Package|Description|
|---|---|---|
|Console/ASP.NET 4.x|`Pivotal.Extensions.Configuration.ConfigServerBase`|Base functionality. No dependency injection.|
|ASP.NET Core|`Pivotal.Extensions.Configuration.ConfigServerCore`|Includes base. Adds ASP.NET Core dependency injection.|
|ASP.NET 4.x with Autofac|`Pivotal.Extensions.Configuration.ConfigServerAutofac`|Includes base. Adds Autofac dependency injection.|

To add this type of NuGet to your project add a `PackageReference` similar to the following:

```xml
<ItemGroup>
...
    <PackageReference Include="Pivotal.Extensions.Configuration.ConfigServerCore" Version= "2.1.0"/>
...
</ItemGroup>
```

### 2.2.2 Configure Settings

The most convenient way to configure settings for the provider is to put them in a file and then use one of the other file-based configuration providers to read them.

The following example shows some provider settings put in a JSON file. Only two settings are really necessary. `spring:application:name` configures the "application name" to be `sample`, and `spring:cloud:config:uri` the address of the config server.

>NOTE: The `spring:application:name` is also used by other Steeltoe libraries in addition to the config server.

```json
{
  "spring": {
    "application": {
      "name": "sample"
    },
    "cloud": {
      "config": {
        "uri": "http://localhost:8888"
      }
    }
  }
  ...
}
```

The following table describes all the settings that can be used to configure the behavior of the provider:

|Key|Description|Default|
|---|---|---|
|name|App name for which to request config|`IHostingEnvironment.ApplicationName`|
|enabled|Enable or disable config server client|true|
|uri|Endpoint of the config server|`http://localhost:8888`|
|env|Environment or profile used in the server request|`IHostingEnvironment.EnvironmentName`|
|validateCertificates|Enable or disable certificate validation|true|
|label|Comma-separated list of labels to request|master|
|timeout|Time to wait for response from server, in milliseconds|6000|
|username|Username for basic authentication|none|
|password|Password for basic authentication|none|
|failFast|Enable or disable failure at startup|false|
|token|Hashicorp Vault authentication token|none|
|tokenTtl|Hashicorp Vault token renewal TTL. Valid on Cloud Foundry only|300000ms|
|tokenRenewRate|Hashicorp Vault token renewal rate. Valid on Cloud Foundry only|60000ms|
|retry:enabled|Enable or disable retry logic|false|
|retry:maxAttempts|Max retries if retry enabled|6|
|retry:initialInterval|Starting interval|1000ms|
|retry:maxInterval|Maximum retry interval|2000ms|
|retry:multiplier|Retry interval multiplier|1.1|

As mentioned earlier, all settings should start with `spring:cloud:config:`

>NOTE: If you use self-signed certificates on Cloud Foundry, you might run into certificate validation issues when pushing an application. A quick way to work around this is to disable certificate validation until a proper solution can be put in place.

### 2.2.3 Add Configuration Provider

Once the provider's settings have been defined and put in a file (such as a JSON file), the next step is to read them and make them available to the provider.

In the next C# example, the provider's configuration settings from the preceding example are put in the `appsettings.json` file included with the application. Then, by using the .NET JSON configuration provider, we can read the settings by adding the JSON provider to the configuration builder (`AddJsonFile("appsettings.json")`.

Then, after the JSON provider has been added, you can add the config server provider to the builder. We include an extension method, `AddConfigServer()`, that you can use to do so.

Because the JSON provider that reads `appsettings.json` has been added `before` the config server provider, the JSON-based settings become available to the Steeltoe provider. Note that you do not have to use JSON for the Steeltoe settings. You can use any of the other off-the-shelf configuration providers for the settings (such as INI files, environment variables, and so on).

You need to `Add*()` the source of the config server clients settings (`AddJsonFile(..)`) *before* you `AddConfigServer(..)`. Otherwise, the settings are not picked up and used.

The following sample shows how to add a configuration provider:

```csharp
using Steeltoe.Extensions.Configuration;
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

When developing an ASP.NET Core application, you can accomplish the same thing by using the `AddConfigServer()` extension method on the `IWebHostBuilder`. The following example shows how to do so:

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        BuildWebHost(args).Run();
    }
    public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseCloudFoundryHosting()

            // Use Config Server for configuration data
            .AddConfigServer()
            .UseStartup<Startup>()
            .Build();
}
```

### 2.2.4 Bind to Cloud Foundry

When you want to use a Config Server on Cloud Foundry and you have installed [Spring Cloud Services](https://docs.pivotal.io/spring-cloud-services/1-5/common/index.html), you can create and bind an instance of it to your application by using the Cloud Foundry CLI, as follows:

```bash
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

Once the service is bound to the application, the config server settings are available and can be setup in `VCAP_SERVICES`.

Then, when you push the application, the Steeltoe provider takes the settings from the service binding and merges those settings with the settings that you have provided through other configuration mechanisms (such as `appsettings.json`).

If there are any merge conflicts, the last provider added to the Configuration takes precedence and overrides all others.

### 2.2.5 Access Configuration Data

When the `ConfigurationBuilder` builds the configuration, the Config Server client makes the appropriate REST calls to the Config Server and retrieves the configuration values based on the settings that have been provided.

If there are any errors or problems accessing the server, the application continues to initialize, but the values from the server are not retrieved. If this is not the behavior you want, you should set the `spring:cloud:config:failFast` to `true`. Once that's done, the application fails to start if problems occur during the build.

After the configuration has been built, you can access the retrieved data directly by using `IConfiguration`. The following example shows how to do so:

```csharp
...
var config = builder.Build();
var property1 = config["myconfiguration:property1"]
var property2 = config["myconfiguration:property2"]
...
```

Alternatively, you can create a class to hold your configuration data and then use the [Options](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) framework together with [Dependency Injection](http://docs.asp.net/en/latest/fundamentals/dependency-injection.html) to inject an instance of the class into your controllers and view.

To do so, first create a class representing the configuration data you expect to retrieve from the server, as shown in the following example:

```csharp
public class MyConfiguration {
    public string Property1 { get; set; }
    public string Property2 { get; set; }
}
```

Next, use the `Configure<>()` method to tell the Options framework to create an instance of that class with the returned data. For the preceding `MyConfiguration` class, you could add the following code to the `ConfigureServices()` method in the `Startup` class in an ASP.NET Core application, as shown in the following example:

```csharp
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; set; }
    public void ConfigureServices(IServiceCollection services)
    {
        // Setup Options framework with DI
        services.AddOptions();

        // Configure IOptions<MyConfiguration>
        services.Configure<MyConfiguration>(Configuration.GetSection("myconfiguration"));
        ...
    }
}
```

The preceding `Configure<MyConfiguration>(Configuration.GetSection("myconfiguration"))` method call instructs the Options framework to bind the `myconfiguration:...` values to an instance of the `MyConfiguration` class.

After this has been done, you can gain access to the data in your `Controller` or `View` through dependency injection. The following example shows how to do so:

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

Sometimes, it is desirable to turn on debug logging in the provider.

To do so, you need to inject the `ILoggerFactory` into the `Startup` class constructor by adding it as an argument to the constructor. Once you have access to it, you can add a console logger to the factory and also set its minimum logging level set to Debug.

Once that is done, pass the `ILoggerFactory` to the Steeltoe configuration provider. The provider then uses it to establish a logger with the debug level logging turned on.

The following example shows how to enable Debug-level logging:

```csharp
using Steeltoe.Extensions.Configuration;

    LoggerFactory logFactory = new LoggerFactory();
    logFactory.AddConsole(minLevel: LogLevel.Debug);

    // Set up configuration sources.
    var builder = new ConfigurationBuilder()
        .SetBasePath(env.ContentRootPath)
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
        .AddEnvironmentVariables()
        .AddConfigServer(env, logFactory);
...
```

# Common Steps

This section describes tasks that are common to many of the processes described in this guide.

## Publish Sample

To use the `dotnet` CLI to build and locally publish the application with your preferred framework and runtime, run the following command:

```bash
> dotnet restore --configfile nuget.config
```

Then run only one of the next three commands.

To publish for Linux with .NET Core, run the following command:

```bash
> dotnet publish -f netcoreapp2.1 -r ubuntu.14.04-x64
```

To publish for Windows with .NET Core, run the following command:

```bash
> dotnet publish -f netcoreapp2.1 -r win10-x64
```

To publish for Linux with .NET Framework, run the following command:

```bash
> dotnet publish -f net461 -r win10-x64
```

## Push Sample

To use the Cloud Foundry CLI to push the published application to Cloud Foundry using the parameters that match what you selected for framework and runtime, run only one of the next three commands.

To push to a Linux cell, run the following command:

```bash
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.1/ubuntu.14.04-x64/publish
```

To push to a Windows cell with .NET Core, run the following command:

```bash
>  # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.1/win10-x64/publish
```

To push to a Windows cell with .NET Framework, run the following command:

```bash
>  # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

>NOTE: Manifest file names may vary. Some samples use a different manifest for .NET 4 vs .NET Core.

>NOTE: All sample manifests have been defined to bind their application to their service(s).
