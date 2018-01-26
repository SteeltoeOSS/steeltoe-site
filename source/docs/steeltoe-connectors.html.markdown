---
title: Service Connectors
order: 40
date: 2018/1/22
tags:
---
<span style="display:inline-block;margin:0 20px;">For use with: </span><span style="display:inline-block;vertical-align:top;width:40%"> ![alt text](/images/CFF_Logo_rgb.png "Cloud Foundry")</span>

Steeltoe Connectors are intended to simplify the process of connecting and using services on Cloud Foundry. Steeltoe Connectors provide a simple abstraction for .NET based applications running on Cloud Foundry enabling them to discover bound services together with the deployment information at runtime. The connectors also provide support for registering the services as injectable service objects.

The Steeltoe Connectors provide out-of-the-box support for discovering many common services on Cloud Foundry. They also include the ability to use settings-based configuration so developers can supply configuration settings at development and testing time, but then have those settings overridden when pushing the application to Cloud Foundry.

All connectors use configuration information from Cloud Foundry's `VCAP_SERVICES` environment variable to detect and configure the available services. This a Cloud Foundry standard that is used to hold connection and identification information for all service instances that have been bound to Cloud Foundry applications.

For more information on `VCAP_SERVICES` see the Cloud Foundry [documentation](https://docs.cloudfoundry.org/).

# 0.0 Initialize Dev Environment

All of the Steeltoe sample applications are in the same repository. If you haven't already, use git to clone the repository or download with your browser from GitHub: [Steeltoe Samples](https://github.com/SteeltoeOSS/Samples)

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
```

> Note: all connector samples in that repository have a base path of `Samples/Connectors/src/`

Make sure your Cloud Foundry CLI tools are logged in and targeting the correct org and space:

```bash
> cf login [-a API_URL] [-u USERNAME] [-p PASSWORD] [-o ORG] [-s SPACE] [--skip-ssl-validation]
or
> cf target -o <YourOrg> -s <YourSpace>
```

# 1.0 MySQL

This connector simplifies using MySql ADO.NET providers in an application running on Cloud Foundry.

Currently the connector supports the following providers:

* [Connector/NET](https://dev.mysql.com/doc/connector-net/en/)
* [MySqlConnector](https://mysql-net.github.io/MySqlConnector/)

In addition to the Quick Start below, there are several other Steeltoe sample applications that you can refer to in order to help you understand how to make use of this connector:

* [AspDotNet4/MySql4](https://github.com/SteeltoeOSS/Samples/tree/master/Connectors/src/AspDotNet4/MySql4) - same as the Quick Start below, but built for ASP.NET 4.x.
* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) - a sample app illustrating how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.
* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ) - a polyglot (i.e. Java and .NET) micro-services based sample app illustrating inter-operability between Java and .NET based micro-services running on Cloud Foundry, secured with OAuth2 Security Services and using Spring Cloud Services.

The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

## 1.1 Quick Start

This quick start consists of using several ASP.NET Core sample applications to illustrate how to use the Steeltoe MySql Connector for connecting to a MySql service on Cloud Foundry.

There are three sample applications you can choose from for this quick start:

* AspDotNetCore/MySql - uses a `MySqlConnection` to issue commands to the bound database.
* AspDotNetCore/MySqlEF6 - uses an Entity Framework 6 `DbContext` to access the bound database.
* AspDotNetCore/MySqlEFCore - uses a Entity Framework Core `DbContext` to access the bound database.

### 1.1.1 Locate Sample

Depending on your specific interests, pick one of the following samples to work with going forward.

```bash
> # Use a `MySqlConnection` sample
> cd Samples/Connectors/src/AspDotNetCore/MySql
>
> # Use a Entity Framework 6 `DbContext` sample
> cd Samples/Connectors/src/AspDotNetCore/MySqlEF6
>
> # Use a Entity Framework Core `DbContext` sample
> cd Samples/Connectors/src/AspDotNetCore/MySqlEFCore
```

### 1.1.2 Create Service

In this step, use the Cloud Foundry CLI to create a service instance of MySql on Cloud Foundry.

The commands below assume you are using the MySql service provided by Pivotal on Cloud Foundry.

If you are using a different service, adjust the `create-service` command below to fit your environment.

```bash
> # Create a MySql service instance on Cloud Foundry
> cf create-service p-mysql 100mb myMySqlService
>
> # Make sure the service is ready
> cf services
```

### 1.1.3 Publish Sample

Use the `dotnet` CLI to build and publish the application.

Note that not all quick start samples can be built to run on all frameworks and run-times.

For example, the Entity Framework 6 DbContext sample can only run on Windows and on the .NET Framework, and the Entity Framework Core DbContext sample can only run on .NET Core.

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

Use the Cloud Foundry CLI to push the published application to Cloud Foundry using the parameters that match what you selected for framework and runtime:

```bash
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.0/ubuntu.14.04-x64/publish
>
> # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.0/win10-x64/publish
>
> # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

Note that the manifests have been defined to bind the application to `myMySqlService` created above.

### 1.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs mysqlefcore-connector`, `cf logs mysqlef6-connector` or `cf logs mysql-connector`)

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

At this point the application is up and running. Upon startup it inserts a couple rows into the bound MySql database.

To display those rows click on the `MySql Data` link in the top menu and you should see the row data displayed.

### 1.1.7 Understand Sample

Each of the samples were created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) and then modified to add the Steeltoe framework.

To gain an understanding of the Steeltoe related changes to the generated template code, examine the following files:

* `*.csproj` files contain `PackageReference` for Steeltoe NuGet Connector and Configuration packages. Additionally, a `PackageReference` for Oracle's MySql provider; `MySql.Data` has been added. If Entity Framework has been used you will see references to those packages as well.
* `Program.cs` - Code added to read the `--server.urls` command line
* `Startup.cs` - Code added to the `ConfigureServices()` method to add a `MySqlConnection` or a `DbContext`, depending on the application, to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry MySql configuration values when pushed to Cloud Foundry.
* `HomeController.cs` - Code added for injection of a `MySqlConnection` or `DbContext` into the Controller. These are used to obtain data from the database and then to display the data.
* `MySqlData.cshtml` - The view used to display the MySql data values.
* `Models folder` - Contains code to initialize the database and also the definition of `DbContext` classes for the MySqlEF6 and MySqlEFCore samples.

## 1.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay attention to the usage of the `ConfigureServices()` method.

To use this connector:

* Create and bind a MySql Service instance to your application.
* Optionally, configure any MySql client settings (e.g. `appsettings.json`) you need.
* Add Steeltoe Cloud Foundry configuration provider to your `ConfigurationBuilder`.
* Add `MySqlConnection` or `DbContext` to your `IServiceCollection`.

### 1.2.1 Add NuGet Reference

To make use of this connector, add a reference to one of the Steeltoe connector NuGet packages. Use this table to determine which package you need:

|App Type|ORM|Package|
|---|---|---|
|ASP.NET Core|Entity Framework 6|`Steeltoe.CloudFoundry.Connector.EF6Core`|
|ASP.NET Core|Entity Framework Core|`Steeltoe.CloudFoundry.Connector.EFCore`|
|ASP.NET Core|Other|`Steeltoe.CloudFoundry.ConnectorCore`|
|Other|Other|`Steeltoe.CloudFoundry.ConnectorBase`|

Use the Nuget package manager tools or directly add the appropriate package to your project using the a `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CloudFoundry.ConnectorBase" Version= "2.0.0-rc1"/>
...
</ItemGroup>
```

In addition to the above, you will need a MySql-specific package: `MySql.Data`, `MySqlConnector` or `Pomelo.EntityFrameworkCore.MySql`.

### 1.2.2 Configure Settings

The MySql connector supports a variety of configuration options. These settings can be used to develop or test an application locally and overridden during deployment.

This MySql connector configuration in shows how to connect to a database at `myserver:3306`:

```json
{
  ...
  "mysql": {
    "client": {
      "server": "myserver",
      "port": 3309
    }
  }
  ...
}
```

Below is a table showing available settings for the connector. These settings are not specific to Steeltoe, they are passed through to the underlying data provider. See the [Oracle MySQL Connection String docs](https://dev.mysql.com/doc/connector-net/en/connector-net-connection-options.html) or [open source MySQL Connection String docs](https://mysql-net.github.io/MySqlConnector/connection-options/) for more information.

As shown above, all of these settings should be prefixed with `mysql:client:`

|Key|Description|Steeltoe Default|
|---|---|:---:|
|server|Hostname or IP Address of server|localhost|
|port|Port number of server|3306|
|username|Username for authentication|not set|
|password|Password for authentication|not set|
|database|Schema to connect to|not set|
|connectionString|Full connection string|built from settings
|sslMode|SSL usage option, `None`, `Preferred`, `Required`|none|
|allowUserVariables|`true` indicates that the provider expects user variables in the SQL|not set|
|connectionTimeout|Seconds to wait for a connection before throwing an error|not set|
|defaultCommandTimeout|Seconds each command can execute before timing out, use zero to disable timeouts|not set|
|oldGuids|Set `true` to use a GUID of data type BINARY(16)|not set|
|persistSecurityInfo|Set to `true` **_(not recommended)_** to allow the application to access to security-sensitive information, such as the password.|not set|
|treatTinyAsBoolean|Set to `false` to return tinyint(1) as sbyte/byte|not set|
|useAffectedRows|Set to `false` to report found rows instead of changed (affected) rows|not set|
|useCompression|If `true` (and server-supported), packets sent between client and server are compressed|not set|

Once the connector's settings have been defined, the next step is to read them in so they can be made available to the connector.

The code below reads connector settings from the file `appsettings.json` with the .NET JSON configuration provider and adds them to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool like [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config)

### 1.2.3 Cloud Foundry

To use MySql on Cloud Foundry, you may create and bind an instance of MySql to your application using the Cloud Foundry CLI as follows:

```bash
> # Create MySql service
> cf create-service p-mysql 100mb myMySqlService
>
> # Bind service to `myApp`
> cf bind-service myApp myMySqlService
>
> # Restage the app to pick up change
> cf restage myApp
```

> Note: The commands above assume you are using [MySql for PCF](https://network.pivotal.io/products/p-mysql), provided by Pivotal on Cloud Foundry. If you are using a different service, you will have to adjust the `create-service` command to fit your environment.

Once the service is bound to your application, the connector's settings will be available in `VCAP_SERVICES`. For the settings to available in the configuration, use the Cloud Foundry configuration provider by adding `AddCloudFoundry()` to the `ConfigurationBuilder`:

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            // Add `VCAP_` configuration info
            .AddCloudFoundry()

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings from the service binding will merge with the settings from other configuration mechanisms (e.g. `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration will take precedence and override all others.

> Note: If you are using the Spring Cloud Config Server, `AddConfigServer()` will automatically call `AddCloudFoundry()` for you

### 1.2.4 Add MySqlConnection

To use a `MySqlConnection` in your application, add it to the service container in the `ConfigureServices()` method of the `Startup` class.

```csharp
using Steeltoe.CloudFoundry.Connector.MySql;

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add MySqlConnection configured from Configuration
        services.AddMySqlConnection(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ...
```

The `AddMySqlConnection(Configuration)` method call above configures the `MySqlConnection` using the configuration built by the application and adds the connection to the service container.

### 1.2.5 Use MySqlConnection

Once you have configured and added the connection to the service container, it is trivial to inject and use in a controller or a view:

```csharp
using MySql.Data.MySqlClient;
...
public class HomeController : Controller
{
    public IActionResult MySqlData([FromServices] MySqlConnection dbConnection)
    {
        dbConnection.Open();

        MySqlCommand cmd = new MySqlCommand("SELECT * FROM TestData;", dbConnection);
        MySqlDataReader rdr = cmd.ExecuteReader();

        while (rdr.Read())
        {
            ViewData["Key" + rdr[0]] = rdr[1];
        }

        rdr.Close();
        dbConnection.Close();

        return View();
    }
}
```

### 1.2.6 Add DbContext

To use Entity Framework, inject and use a `DbContext` in your application instead of a `MySqlConnection` by using the `AddDbContext<>()` method:

```csharp
using Steeltoe.CloudFoundry.Connector.MySql.EFCore
... OR
using Steeltoe.CloudFoundry.Connector.MySql.EF6;

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // If using EF6
        services.AddDbContext<TestContext>(Configuration);

        // If using EFCore
        services.AddDbContext<TestContext>(options => options.UseMySql(Configuration));

        // Add framework services.
        services.AddMvc();
        ...
    }
    ...
```

The `AddDbContext<TestContext>(..)` method call configures `TestContext` using the configuration built earlier and then adds the DbContext (i.e. `TestContext`) to the service container.

You will define your `DbContext` differently depending on whether you are using Entity Framework 6 or Entity Framework Core.

Here are examples for both:

```csharp
// ------- EF6 DbContext ---------
using MySql.Data.Entity;
using System.Data.Entity;
...

[DbConfigurationType(typeof(MySqlEFConfiguration))]
public class TestContext : DbContext
{
    public TestContext(string connectionString) : base(connectionString)
    {
    }
    public DbSet<TestData> TestData { get; set; }
}

// ------- EFCore DbContext ------
using Microsoft.EntityFrameworkCore;
...

public class TestContext : DbContext
{
    public TestContext(DbContextOptions options) : base(options)
    {

    }
    public DbSet<TestData> TestData { get; set; }
}

```

### 1.2.7 Use DbContext

Once you have configured and added the DbContext to the service container, inject and use it in a controller or a view:

```csharp
using Project.Models;
...
public class HomeController : Controller
{
    public IActionResult MySqlData([FromServices] TestContext context)
    {
        return View(context.TestData.ToList());
    }
```

# 2.0 PostgreSQL

This connector simplifies using PostgreSQL in an application running on Cloud Foundry.

Currently the connector supports the following providers:

* [Npgsql](http://www.npgsql.org/)

The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

## 2.1 Quick Start

This quick start consists of several ASP.NET Core sample applications to illustrate how to use the Steeltoe PostgreSQL Connector for connecting to a PostgreSQL service on Cloud Foundry.

There are two sample applications to choose from:

* PostgreSql - illustrates how to use a `NpgsqlConnection` to issue commands to the bound database.
* PostgreEFCore - illustrates how to use a Entity Framework Core `DbContext` to access the bound database.

### 2.1.1 Locate Sample

Depending on your specific interests, pick one of the following samples to work with going forward.

```bash
> # Use a `NpgsqlConnection`
> cd Samples/Connectors/src/AspDotNetCore/PostgreSql
>
> # Use a Entity Framework Core `DbContext`
> cd Samples/Connectors/src/AspDotNetCore/PostgreEFCore
```

### 2.1.2 Create Service

Use the Cloud Foundry CLI to create a service instance of PostgreSQL on Cloud Foundry.

The commands below assume you are using the EDB PostgreSQL service on Cloud Foundry.

If you are using a different service, adjust the `create-service` command to fit environment.

```bash
> # Create a PostgreSQL service instance on Cloud Foundry
> cf create-service EDB-Shared-PostgreSQL "Basic PostgreSQL Plan" myPostgres
>
> # Make sure the service is ready
> cf services
```

### 2.1.3 Publish Sample

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

### 2.1.4 Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry using the parameters that match what you selected for framework and runtime:

```bash
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.0/ubuntu.14.04-x64/publish
>
> # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.0/win10-x64/publish
>
> # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

> Note: the manifest files have all been defined to bind the application to the `myPostgres` instance created above.

### 2.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs postgres-connector`)

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

### 2.1.6 What to expect

At this point, the app is up and running. Upon startup it inserts a couple rows into the bound PostgreSQL database.

To display those rows, click on the `Postgres Data` link in the top menu.

### 2.1.7 Understand Sample

Each of the samples were created from the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) and then modified to include the Steeltoe framework.

To gain an understanding of the Steeltoe related changes to the generated template code, examine the following files:

* `PostgreSql.csproj` - Contains a `PackageReference` for Steeltoe NuGet `Steeltoe.CloudFoundry.ConnectorCore`
* `PostgreEFCore.csproj` - Contains a `PackageReference` for Steeltoe NuGet `Steeltoe.CloudFoundry.Connector.EFCore`
* `Program.cs` - Code added to read the `--server.urls` command line.
* `Startup.cs` - Code added to the `ConfigureServices()` method to add a `NpgsqlConnection` or a `DbContext` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry PostgreSQL configuration values when pushed to Cloud Foundry.
* `HomeController.cs` - Code added to inject a `NpgsqlConnection` or `DbContext` into the Controller and obtain data from the database for the view.
* `PostgresData.cshtml` - The view used to display the PostgreSQL data values.
* `Models folder` - contains code to initialize the database and also the `DbContext` for PostgreEFCore sample.

## 2.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Pay attention to the `ConfigureServices()` method.

To use this connector:

* Create and bind a PostgreSQL Service instance to your application.
* Optionally, configure any PostgreSQL client settings (e.g. `appsettings.json`)
* Add Steeltoe Cloud Foundry config provider to your `ConfigurationBuilder`.
* Add `NpgsqlConnection` or `DbContext` to your `IServiceCollection`.

### 2.2.1 Add NuGet Reference

To make use of this connector, add a reference to one of the Steeltoe connector NuGet packages. Use this table to determine which package you need:

|App Type | ORM | Package |
|--- | --- | --- |
|ASP.NET Core | Entity Framework 6 | `Steeltoe.CloudFoundry.Connector.EF6Core` |
|ASP.NET Core | Entity Framework Core | `Steeltoe.CloudFoundry.Connector.EFCore` |
|ASP.NET Core | Other | `Steeltoe.CloudFoundry.ConnectorCore`
|Other | Other | `Steeltoe.CloudFoundry.ConnectorBase`

Use the Nuget package manager tools or directly add the appropriate package to your project using the a `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CloudFoundry.ConnectorBase" Version= "2.0.0-rc1"/>
...
</ItemGroup>
```

In addition to the above, you also need to add a PostgreSQL package reference to your application, as you would if you were not using Cloud Foundry (eg: `Npgsql` or `Npgsql.EntityFrameworkCore.PostgreSQL`)

### 2.2.2 Configure Settings

The PostgreSQL connector supports several settings for creating the `NpgsqlConnection` to a database. This can be useful when you are developing and testing an application locally and need to configure the connector for non-default settings.

Here is an example PostgreSQL connector configuration in JSON that shows how to setup a connection to a database at `myserver:5432`:

```json
{
  ...
  "postgres": {
    "client": {
      "host": "myserver",
      "port": 5432
    }
  }
  ...
}
```

Below is a table showing all possible settings for the connector.

As shown above, all of these settings should be prefixed with `postgres:client:`

|Key|Description|Default
|---|---|---|
|server|Hostname or IP Address of server|localhost|
|port|Port number of server|5432|
|username|Username for authentication|not set|
|password|Password for authentication|not set|
|database|Schema to connect to|not set|
|connectionString|Full connection string|built from settings

Once the connector's settings have been defined, the next step is to read them in so they can be made available to the connector.

The code below reads connector settings from the file `appsettings.json` with the .NET JSON configuration provider and adds them to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.

```csharp

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool like [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config)

### 2.2.3 Cloud Foundry

To use PostgreSQL on Cloud Foundry, after a PostgreSQL service is installed, you can create and bind an instance of it to your application using the Cloud Foundry CLI as follows:

```bash
> # Create PostgreSQL service
> cf create-service EDB-Shared-PostgreSQL "Basic PostgreSQL Plan" myPostgres
>
> # Bind service to `myApp`
> cf bind-service myApp myPostgres
>
> # Restage the app to pick up change
> cf restage myApp
```

> Note: The commands above are for the PostgreSQL service provided by EDB on Cloud Foundry. For another service, adjust the `create-service` command to fit your environment.

Once the service is bound to your application, the connector's settings will be available in `VCAP_SERVICES`. For the settings to be available in the configuration, use the Cloud Foundry configuration provider by adding `AddCloudFoundry()` method call to the `ConfigurationBuilder`:

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            // Add `VCAP_` configuration info
            .AddCloudFoundry()

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings that have been provided by the service binding will merge with the settings from other configuration mechanisms (e.g. `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration will take precedence and override all others.

> Note: If you are using the Spring Cloud Config Server, `AddConfigServer()` will automatically call `AddCloudFoundry()` for you

### 2.2.4 Add NpgsqlConnection

 To use a `NpgsqlConnection` in your application, add it to the service container in the `ConfigureServices()` method of the `Startup` class:

 ```csharp
 using Steeltoe.CloudFoundry.Connector.PostgreSql;

 public class Startup {
     ...
     public IConfigurationRoot Configuration { get; private set; }
     public Startup(...)
     {
       ...
     }
     public void ConfigureServices(IServiceCollection services)
     {
         // Add NpgsqlConnection configured from Cloud Foundry
         services.AddPostgresConnection(Configuration);

         // Add framework services.
         services.AddMvc();
         ...
     }
     ...
 ```

 The `AddPostgresConnection(Configuration)` method call configures the `NpgsqlConnection` using the configuration built by the application and adds the connection to the service container.

### 2.2.5 Use NpgsqlConnection

 Once the connection is configured and added to the service container, it is easy to inject and use in a controller or a view:

```csharp
using Npgsql;
...
public class HomeController : Controller
{
    public IActionResult PostgresData([FromServices] NpgsqlConnection dbConnection)
    {
        dbConnection.Open();

        NpgsqlCommand cmd = new NpgsqlCommand("SELECT * FROM TestData;", dbConnection);
        var rdr = cmd.ExecuteReader();

        while (rdr.Read())
        {
            ViewData["Key" + rdr[0]] = rdr[1];
        }

        rdr.Close();
        dbConnection.Close();

        return View();
    }
}

```

### 2.2.6 Add DbContext

To use Entity Framework, inject and use a `DbContext` in your application instead of a `NpgsqlConnection` via the `AddDbContext<>()` method:

```csharp
#using Steeltoe.CloudFoundry.Connector.PostgreSql.EFCore;

public class Startup {
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add EFCore TestContext configured with a PostgreSQL configuration
        services.AddDbContext<TestContext>(options => options.UseNpgsql(Configuration));

        // Add framework services.
        services.AddMvc();
        ...
    }
```

The `AddDbContext<TestContext>(options => options.UseNpgsql(Configuration));` method call configures the `TestContext` using the configuration built by the application and adds the context to the service container.

Here is how you would define the `DbContext`:

```csharp
using Microsoft.EntityFrameworkCore;
...

public class TestContext : DbContext
{
    public TestContext(DbContextOptions options) : base(options)
    {
    }
    public DbSet<TestData> TestData { get; set; }
}
```

### 2.2.7 Use DbContext

Once you have configured and added the context to the service container, inject and use it in a controller or a view:

```csharp
using Project.Models;
...
public class HomeController : Controller
{
    public IActionResult PostgresData([FromServices] TestContext context)
    {
        return View(context.TestData.ToList());
    }
}
```

# 3.0 Microsoft SQL Server

This connector simplifies using Microsoft SQL Server in an application running on Cloud Foundry. The connector is built to work with `System.Data.SqlClient` and provides additional extension methods for using Entity Framework.

The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

## 3.1 Quick Start

This quick start consists of several ASP.NET sample applications to illustrate how to use the Steeltoe SQL Server Connector for connecting to a SQL server from an application running on Cloud Foundry.

There are two sample applications to choose from:

AspDotNet4/MsSql4 - using MVC5 and Entity Framework to issue commands to the bound database.
AspDotNetCore/SqlServerEFCore - using ASP.NET Core and Entity Framework Core to access the bound database.

### 3.1.1 Locate Sample

Depending on your specific interests, pick one of the following samples to work with going forward.

```bash
> # Use a .NET4/EF6 sample
> cd Samples/Connectors/src/AspDotNet4/MsSql4
>
> # Use a .NETCORE/EFCore sample
> cd Samples/Connectors/src/AspDotNetCore/SqlServerEFCore
```

### 3.1.2 Create Service

If the [Microsoft SQL Server broker](https://github.com/cf-platform-eng/mssql-server-broker) is installed in your Cloud Foundry instance, use it to create a new service instance:

```bash
> cf create-service SqlServer sharedVM mySqlServerService
```

An alternative to the broker is to use a User-Provided service to explicitly provide connection information to the application:

```bash
> cf cups mySqlServerService -p '{"pw": "|password|","uid": "|user id|","uri": "jdbc:sqlserver://|host|:|port|;databaseName=|database name|"}'
```

### 3.1.3 Publish Sample

#### 3.1.3.1 Publish ASP.NET Core

Use the `dotnet` CLI to build and publish the application.

Note that not all quick start samples can be built to run on all frameworks and run-times.

For example, the Entity Framework 6 DbContext sample can only run on Windows and on the .NET Framework, and the Entity Framework Core DbContext sample can only run on .NET Core.

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

#### 3.1.3.2 Publish ASP.NET 4.x

To publish ASP.NET 4.x applications, you'll want to use the Visual Studio publishing tools:

1. Select MsSql4 project in Solution Explorer.
1. Right-click and select Publish
1. Select the profile `FolderProfile` *(if for some reason this profile is missing, create a profile that publishes to a local folder `bin/Debug/net461/win10-x64/publish`)*
1. Click Publish

### 3.1.4 Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry.

Note below we show how to push for both Linux and Windows. Select one in order to proceed, but be aware that the only one that works for the ASP.NET 4x sample is the first one:

```bash
> # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
>
> # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.0/win10-x64/publish
>
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.0/ubuntu.14.04-x64/publish
```

> Note: the manifest files have been defined to bind the application to the `mySqlServerService` created above.

### 3.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs sqlserverefcore-connector` or `cf logs mssql4-connector`)

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

### 3.1.6 What to expect

At this point the application is up and running. Upon startup it inserts two rows into the bound Microsoft SQL database.

Loading the home page of the application will display those rows.

### 3.1.7 Understand Samples

#### 3.1.7.1 ASP.NET Core Sample

This sample was created from the .NET Core tooling mvc template (i.e. `dotnet new mvc`) and then modified to include the Steeltoe framework.

To understand the Steeltoe related changes to the generated template code, examine the following files:

* `*.csproj` file contains `PackageReference` for Steeltoe NuGet Connector and Entity Framework.
* `Program.cs` - Code added to read the `--server.urls` command line
* `Startup.cs` - Code added to the `ConfigureServices()` method to add a `DbContext` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry Microsoft SQL Server configuration values when pushed to Cloud Foundry.
* `HomeController.cs` - Code added for injection of a `TestContext` into the Controller to obtain data from the database and then to display the data.
* `Index.cshtml` - The view used to display the data values from SQL Server.
* `Models folder` - Contains code to initialize the database and also the definition of `DbContext` class.

#### 3.1.7.2 ASP.NET 4.x Sample

This sample was created using the standard Visual Studio template (File -> New Project) and then modified to add the Steeltoe framework.

To understand the Steeltoe related changes to the generated template code, examine the following files:

* `packages.config` contains references to the Steeltoe Common, Connector and Configuration packages along with Entity Framework and StructureMap.
* `DependencyResolution folder` - contains several classes from the StructureMap package - `IoC.cs` is what orchestrates application configuration and sets up dependency injection.
* `Data folder` - Contains code to initialize the database and also the definition of `DbContext` class.
* `HomeController.cs` - Code added for injection of `IBloggingContext` into the Controller to obtain data from the database and then to display the data.
* `Index.cshtml` - The view used to display the data values from SQL Server.

## 3.2 Usage

You should have some understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay attention to the usage of the `ConfigureServices()` method.

To use this connector:

* Create and bind a Microsoft SQL Service instance to your application.
* Optionally, configure any MySql client settings (e.g. `appsettings.json`) you need.
* Add Steeltoe Cloud Foundry configuration provider to your `ConfigurationBuilder`.
* Add `SqlConnection` or `DbContext` to your `IServiceCollection`.

### 3.2.1 Add NuGet Reference

To make use of this connector, add a reference to one of the Steeltoe connector NuGet packages. Use this table to determine which package you need:

|App Type|ORM|Steeltoe Package|SQL Server Package|
|---|---|---|---|
|ASP.NET Core|Entity Framework 6|`Steeltoe.CloudFoundry.Connector.EF6Core`|`EntityFramework`|
|ASP.NET Core|Entity Framework Core|`Steeltoe.CloudFoundry.Connector.EFCore`|`Microsoft.EntityFrameworkCore.SqlServer`|
|ASP.NET Core|Other|`Steeltoe.CloudFoundry.ConnectorCore`|`System.Data.SqlClient`|
|Other|Other|`Steeltoe.CloudFoundry.ConnectorBase`|`System.Data.SqlClient`|

Use the Nuget package manager tools or directly add the appropriate packages to your project using the a `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CloudFoundry.ConnectorBase" Version= "2.0.0-rc1"/>
    <PackageReference Include="System.Data.SqlClient" Version= "4.4.0"/>
...
</ItemGroup>
```

### 3.2.2 Configure Settings

The Microsoft SQL Server connector supports several configuration options. These settings can be used to develop or test an application locally and overridden during deployment.

This Microsoft SQL Server connector configuration shows how to connect to SQL Server 2016 Express LocalDB:

```json
{
  ...
  "sqlserver": {
    "credentials": {
        "connectionString": "Server=(localdb)\\mssqllocaldb;database=Steeltoe;Trusted_Connection=True;"
    }
  }
  ...
}
```

Below is a table showing available settings for the connector. As shown above, all of these settings should be prefixed with `sqlserver:credentials:`

|Key|Description|Steeltoe Default|
|---|---|---|
|server|Hostname or IP Address of server|localhost|
|port|Port number of server|1433|
|username|Username for authentication|not set|
|password|Password for authentication|not set|
|database|Schema to connect to|not set|
|connectionString|Full connection string|built from settings|
|integratedSecurity|Enable Windows Authentication (For local use only)|not set|

Once the connector's settings have been defined, the next step is to read them in so they can be made available to the connector.

The code below reads connector settings from the file `appsettings.json` with the .NET JSON configuration provider and adds them to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool like [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config)

### 3.2.3 Cloud Foundry

To use Microsoft SQL Server on Cloud Foundry, you need a service instance bound to your application. If the [Microsoft SQL Server broker](https://github.com/cf-platform-eng/mssql-server-broker) is installed in your Cloud Foundry instance, use it to create a new service instance:

```bash
> cf create-service SqlServer sharedVM mySqlServerService
```

An alternative to the broker is to use a User-Provided service to explicitly provide connection information to the application:

```bash
> cf cups mySqlServerService -p '{"pw": "|password|","uid": "|user id|","uri": "jdbc:sqlserver://|host|:|port|;databaseName=|database name|"}'
```

If you are creating the service for an app that has already been deployed, you will need to bind the service and restart or restage the app with the commands below. If the application has not already been deployed, using a reference in the manifest.yml file will take care of the binding for you.

```bash
> # Bind service to `myApp`
> cf bind-service myApp mySqlServerService
>
> # Restage the app to pick up change
> cf restage myApp
```

> Note: The commands above are may not exactly match the service or plan names available in your environment. You may have to adjust the `create-service` command to fit your environment. Use `cf marketplace` to see what is available.

Once the service is bound to your application, the connector's settings will be available in `VCAP_SERVICES`. For the settings to available in the configuration, use the Cloud Foundry configuration provider by adding `AddCloudFoundry()` to the `ConfigurationBuilder`:

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            // Add `VCAP_` configuration info
            .AddCloudFoundry()

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings from the service binding will merge with the settings from other configuration mechanisms (e.g. `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration will take precedence and override all others.

> Note: If you are using the Spring Cloud Config Server, `AddConfigServer()` will automatically call `AddCloudFoundry()` for you

### 3.2.4 Add SqlConnection

To use a `SqlConnection` in your application, add it to the service container in the `ConfigureServices()` method of the `Startup` class.

```csharp
using Steeltoe.CloudFoundry.Connector.MySql;

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add SqlConnection configured from Configuration
        services.AddSqlServerConnection(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ...
```

The `AddSqlServerConnection(Configuration)` method call above configures the `SqlConnection` using the configuration built by the application and adds the connection to the service container.

### 3.2.5 Use SqlConnection

Once you have configured and added the connection to the service container, it is trivial to inject and use in a controller or a view:

```csharp
using System.Data.SqlClient;
...
public class HomeController : Controller
{
    public IActionResult SqlData([FromServices] SqlConnection dbConnection)
    {
        dbConnection.Open();

        MySqlCommand cmd = new MySqlCommand("SELECT * FROM TestData;", dbConnection);
        MySqlDataReader rdr = cmd.ExecuteReader();

        while (rdr.Read())
        {
            ViewData["Key" + rdr[0]] = rdr[1];
        }

        rdr.Close();
        dbConnection.Close();

        return View();
    }
}
```

> Note: the above code does not create a database, table or insert data! It will fail as written unless you create the database, table and data ahead of time.

### 3.2.6 Add DbContext

To use Entity Framework, inject and use a `DbContext` in your application instead of a `SqlConnection` by using the `AddDbContext<>()` method:

```csharp
using Steeltoe.CloudFoundry.Connector.Sql.EFCore
// OR
using Steeltoe.CloudFoundry.Connector.Sql.EF6;

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // If using EF6
        services.AddDbContext<TestContext>(Configuration);

        // If using EFCore
        services.AddDbContext<TestContext>(options => options.UseSqlServer(Configuration));

        // Add framework services.
        services.AddMvc();
        ...
    }
    ...
```

The `AddDbContext<TestContext>(..)` method call configures `TestContext` using the configuration built earlier and then adds the `DbContext` (i.e. `TestContext`) to the service container.

You will define your `DbContext` differently depending on whether you are using Entity Framework 6 or Entity Framework Core.

Here are examples for both:

```csharp
// ------- EF6 DbContext ---------
using System.Data.Entity;
...

public class TestContext : DbContext
{
    public TestContext(string connectionString) : base(connectionString)
    {
    }
    public DbSet<TestData> TestData { get; set; }
}

// ------- EFCore DbContext ------
using Microsoft.EntityFrameworkCore;
...

public class TestContext : DbContext
{
    public TestContext(DbContextOptions options) : base(options)
    {

    }
    public DbSet<TestData> TestData { get; set; }
}

```

### 3.2.7 Use DbContext

Once you have configured and added the DbContext to the service container, inject and use it in a controller or a view:

```csharp
using Project.Models;
...
public class HomeController : Controller
{
    public IActionResult SqlData([FromServices] TestContext context)
    {
        return View(context.TestData.ToList());
    }
```

# 4.0 RabbitMQ

This connector simplifies using the [RabbitMQ Client](https://www.rabbitmq.com/tutorials/tutorial-one-dotnet.html) in an application running on Cloud Foundry. You will want some understanding of how to use it before proceeding to use the connector.

The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

## 4.1 Quick Start

This quick start uses an ASP.NET Core sample application and the Steeltoe RabbitMQ Connector to connect to a RabbitMQ service on Cloud Foundry.

Specifically it shows how to use a `RabbitMQ.Client` to send and receive messages on the bound RabbitMQ service.

### 4.1.1 Locate Sample

```bash
> cd Samples/Connectors/src/AspDotNetCore/Rabbit
```

### 4.1.2 Create Service

Use the Cloud Foundry CLI to create a service instance of RabbitMQ on Cloud Foundry.

The commands below assume you are using the RabbitMQ service provided by Pivotal on Cloud Foundry.

If you are using a different service, adjust the `create-service` command below to fit your environment.

```bash
> # Create a RabbitMQ service instance on Cloud Foundry
> cf create-service p-rabbitmq standard myRabbitService
>
> # Make sure the service is ready
> cf services
```

### 4.1.3 Publish Sample

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

### 4.1.4 Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry using the parameters that match what you selected for framework and runtime:

```bash
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.0/ubuntu.14.04-x64/publish
>
> # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.0/win10-x64/publish
>
> # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

> Note: the manifests have been defined to bind the application to the `myRabbitService` created above.

### 4.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs rabbit`)

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

### 4.1.6 What to expect

At this point the app is up and running.

To send a message click "Send" and use the form to send a message over RabbitMQ.

Having sent a message, click "Receive" to see those messages.

### 4.1.7 Understand Sample

The sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) and then modified to use the Steeltoe framework.

To gain an understanding of the Steeltoe related changes to the generated template code, examine the following files:

* `Rabbit.csproj` - Contains `PackageReference` for `RabbitMQ.Client` and Steeltoe NuGet `Steeltoe.CloudFoundry.ConnectorCore`
* `Program.cs` - Code added to read the `--server.urls` command line.
* `Startup.cs` - Code added to the `ConfigureServices()` method to add a RabbitMQ `ConnectionFactory` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry RabbitMQ configuration values when pushed to Cloud Foundry.
* `RabbitController.cs` - Code added for injection of a RabbitMQ `ConnectionFactory` into the Controller. The `ConnectionFactory` is used in the `Send` and `Receive` action methods.
* `Receive.cshtml` - The view used to display the received message data values.
* `Send.cshtml` - The view used to submit message data.

## 4.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()` method.

You probably will want some understanding of how to use the [RabbitMQ Client](https://www.rabbitmq.com/tutorials/tutorial-one-dotnet.html) before starting to use this connector.

To use this Connector:

* Create and bind a RabbitMQ Service instance to your application.
* Optionally, configure any RabbitMQ client settings (e.g. appsettings.json)
* Add Steeltoe Cloud Foundry config provider to your ConfigurationBuilder.
* Add RabbitMQ ConnectionFactory to your ServiceCollection.

### 4.2.1 Add NuGet Reference

To use the connector, you need to add a reference to the appropriate Steeltoe Connector NuGet package.

If your application uses Microsoft's Dependency Injection, use the `Steeltoe.CloudFoundry.ConnectorCore` package. If you do not use Microsoft's Dependency Injection, use `Steeltoe.CloudFoundry.ConnectorBase`.

Use the NuGetPackage manager or directly add the following package references to your .csproj file to add the desired connector package and `RabbitMQ.Client`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CloudFoundry.ConnectorCore" Version= "2.0.0-rc1"/>
    <PackageReference Include="RabbitMQ.Client" Version= "x.y.z"/>
...
</ItemGroup>
```

### 4.2.2 Configure Settings

The connector supports several settings for the RabbitMQ ConnectionFactory, which can be useful when you are developing and testing an application locally and you need to have the connector configure the connection for non-default settings.

Here is an example of the connectors configuration in JSON that shows how to setup a connection to a RabbitMQ server at `amqp://guest:guest@127.0.0.1/`.

```json
{
  ...
  "rabbit": {
    "client": {
      "uri": "amqp://guest:guest@127.0.0.1/"
    }
  }
  ...
}
```

Below is a table showing all possible settings for the connector.

As shown above, all of these settings should be prefixed with `rabbit:client:`

|Key|Description|Default|
|---|---|---|
|server|Hostname or IP Address of server|127.0.0.1|
|port|Port number of server|5672|
|username|Username for authentication|not set|
|password|Password for authentication|not set|
|virtualHost|Virtual host to connect to|not set|
|sslEnabled|Should SSL be enabled|false|
|sslPort|SSL Port number of server|5671|
|uri|Full connection string|built from settings|

Once the connector's settings have been defined, the next step is to read them in so they can be made available to the connector.

The code below reads connector settings from the file `appsettings.json` with the .NET JSON configuration provider and adds them to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.

```csharp

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool like [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config)

### 4.2.3 Cloud Foundry

To use RabbitMQ on Cloud Foundry, you may create and bind an instance to your application using the Cloud Foundry CLI as follows:

```bash
> # Create RabbitMQ service
>cf create-service p-rabbitmq standard myRabbitService
>
> # Bind service to `myApp`
> cf bind-service myApp myRabbitService
>
> # Restage the app to pick up change
> cf restage myApp
```

> Note: The commands above assume you are using the RabbitMQ service provided by Pivotal on Cloud Foundry. If you are using a different service, adjust the `create-service` command to fit your environment.

Once the service is bound to your application, the connector's settings will be available in `VCAP_SERVICES`.

For the settings to be available in the configuration, use the Cloud Foundry configuration provider by adding `AddCloudFoundry()` to the `ConfigurationBuilder`:

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            // Add `VCAP_` configuration info
            .AddCloudFoundry()

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings from the service binding will merge with the settings from other configuration mechanisms (e.g. `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration will take precedence and override all others.

> Note: If you are using the Spring Cloud Config Server, `AddConfigServer()` will automatically call `AddCloudFoundry()` for you

### 4.2.4 Add RabbitMQ ConnectionFactory

To use a RabbitMQ `ConnectionFactory` in your application, add it to the service container in the `ConfigureServices()` method of the `Startup` class:

```csharp
using Steeltoe.CloudFoundry.Connector.Rabbit;

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add RabbitMQ ConnectionFactory configured from Cloud Foundry
        services.AddRabbitMQConnection(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ...
```

### 4.2.5 Use RabbitMQ ConnectionFactory

Once you have configured and added the RabbitMQ `ConnectionFactory` to the service container, inject and use it in a controller or a view:

 ```csharp
using RabbitMQ.Client;
 ...
 public class HomeController : Controller
 {
     ...
     public IActionResult RabbitData([FromServices] ConnectionFactory factory)
     {

         using (var connection = factory.CreateConnection())
         using (var channel = connection.CreateModel())
         {
             CreateQueue(channel);
             var body = Encoding.UTF8.GetBytes("a message");
             channel.BasicPublish(exchange: "",
                                  routingKey: "a-topic",
                                  basicProperties: null,
                                  body: body);

         }
         return View();
     }

 }

 ```

# 5.0 Redis

 This connector simplifies using a Microsoft [RedisCache](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/distributed#using-a-redis-distributed-cache) and/or a StackExchange [IConnectionMultiplexer](https://stackexchange.github.io/StackExchange.Redis/) in an application running on Cloud Foundry.

 In addition to the Quick Start below, there are other Steeltoe sample applications available to help you understand how to make use of this connector:

* [DataProtection](https://github.com/SteeltoeOSS/Samples/tree/master/Security/src/RedisDataProtectionKeyStore) - sample app illustrating how to use the Steeltoe DataProtection Key Storage Provider for Redis.
* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) - a sample app illustrating how to use all of the Steeltoe components together in an ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core reference app MusicStore provided by Microsoft.

The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

## 5.1 Quick Start

This quick start consists of using a ASP.NET Core sample application to illustrate how to use the Steeltoe Redis Connector for connecting to a Redis service on Cloud Foundry.

### 5.1.1 Locate Sample

```bash
> cd Samples/Connectors/src/AspDotNetCore/Redis
```

### 5.1.2 Create Service

Use the Cloud Foundry CLI to create a service instance of Redis on Cloud Foundry.

The commands below assume you are using the Redis service provided by Pivotal on Cloud Foundry.

If you are using a different service then you will have to adjust the `create-service` command below to fit your environment.

```bash
> # Create a Redis service instance on Cloud Foundry
> cf create-service p-redis shared-vm myRedisService
>
> # Make sure the service is ready
> cf services
```

### 5.1.3 Publish Sample

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

### 5.1.4 Push Sample

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

> Note: the manifests have been defined to bind the application to `myRedisService` created above.

### 5.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs redis-connector`)

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

### 5.1.6 What to expect

At this point the app is up and running. Upon startup, the app inserts two key/value pairs into the bound Redis Cache.

To display those values, click on the Cache Data link in the menu and you should see the key/value pairs displayed using the Microsoft `RedisCache`.

Click on the ConnectionMultiplexer Data link to view data using the StackExchange `ICollectionMultiplexer`.

### 5.1.7 Understand Sample

The sample was created from the .NET Core tooling `mvc` template (i.e. `dotnet new mvc`) and modified to use the Steeltoe frameworks.

To understand the Steeltoe related changes to the generated template code, examine the following files:

* `Redis.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.CloudFoundry.ConnectorCore`
* `Program.cs` - Code added to read the `--server.urls` command line.
* `Startup.cs` - Code added to the `ConfigureServices()` method to add an `IDistributedCache` and an `IConnectionMultiplexer` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry Redis service configuration values when pushed to Cloud Foundry.
* `HomeController.cs` - Code added for injection of a `IDistributedCache` or `IConnectionMultiplexer` into the Controller.  These are used to obtain data from the cache and then to display it.
* `CacheData.cshtml` - The view used to display the Redis data values obtained using `IDistributedCache`.
* `ConnData.cshtml` - The view used to display the Redis data values obtained using `IConnectionMultiplexer`.
* `Models folder`- contains code to initialize the Redis cache.

## 5.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()` method.

You probably will want some understanding of how to use the [RedisCache](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/distributed#using-a-redis-distributed-cache) and/or [IConnectionMultiplexer](https://stackexchange.github.io/StackExchange.Redis/) before starting to use this connector.

To use this connector:

* Create and bind a Redis Service instance to your application.
* Optionally, configure any Redis client settings (e.g. `appsettings.json`)
* Add Steeltoe Cloud Foundry config provider to your ConfigurationBuilder.
* Add DistributedRedisCache and/or ConnectionMultiplexer to your ServiceCollection.

### 5.2.1 Add NuGet Reference

To use the connector, you need to add a reference to the appropriate Steeltoe Connector NuGet package and a reference to `Microsoft.Extensions.Caching.Redis`, `StackExchange.Redis` or `StackExchange.Redis.StrongName`.

> Note: This requirement is a change for version 2.x - version 1.x packages do NOT require a direct Redis package reference!

If your application uses Microsoft's Dependency Injection, use the `Steeltoe.CloudFoundry.ConnectorCore` package. If you do not use Microsoft's Dependency Injection, use `Steeltoe.CloudFoundry.ConnectorBase`.

Use the NuGet Package Manager tools or directly add the following package references to your .csproj file to include the Steeltoe connector and Redis libraries:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CloudFoundry.ConnectorCore" Version= "2.0.0-rc1"/>
    <PackageReference Include="Microsoft.Extensions.Caching.Redis" Version= "x.y.z"/>
...
</ItemGroup>
```

> Note: because `Microsoft.Extensions.Caching.Redis` depends on `StackExchange.Redis.StrongName`, adding a reference to the Microsoft library will also enable access to the StackExchange classes as seen in the sample application.

### 5.2.2 Configure Settings

The connector supports several settings for the Redis connection, which can be useful when you are developing and testing an application locally and you need to have the connector configure the connection for non-default settings.

Here is an example of the connector's configuration in JSON that shows how to setup a connection to a Redis server at `http://foo.bar:1111`

```json
{
  ...
  "redis": {
    "client": {
      "host": "http://foo.bar",
      "port": 1111
    }
  }
  ...
}
```

Below is a table showing all possible settings for the connector.

As shown above, all of these settings should be prefixed with `redis:client:`

|Key|Description|Default|
|---|---|---|
|host|Hostname or IP Address of server|localhost|
|port|Port number of server|6379|
|endPoints|Comma separated list of host:port pairs|not set|
|clientName|Identification for the connection within redis|not set|
|connectRetry|Times to repeat initial connect attempts|3|
|connectTimeout|Timeout (ms) for connect operations|5000|
|abortOnConnectFail|Will not create a connection while no servers are available|true|
|keepAlive|Time (seconds) at which to send a message to help keep sockets alive|-1|
|resolveDns|DNS resolution should be explicit and eager, rather than implicit|false|
|ssl|SSL encryption should be used|false|
|sslHost|Enforces a particular SSL host identity on the server's certificate|not set|
|writeBuffer|Size of the output buffer|4096|
|connectionString|Connection string, use instead of values above|not set|
|instanceId|Cache id, used only with IDistributedCache|not set|

Once the connector's settings have been defined, the next step is to read them in so they can be made available to the connector.

The code below reads connector settings from the file `appsettings.json` with the .NET JSON configuration provider and adds them to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.

```csharp

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool like [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config)

### 5.2.3 Cloud Foundry

To use Redis on Cloud Foundry, create and bind an instance to your application using the Cloud Foundry CLI:

```bash
> # Create Redis service
> cf create-service p-redis shared-vm myRedisCache
>
> # Bind service to `myApp`
> cf bind-service myApp myRedisCache
>
> # Restage the app to pick up change
> cf restage myApp
```

> Note: The commands above assume you are using the Redis service provided by Pivotal on Cloud Foundry. If you are using a different service then you will have to adjust the `create-service` command to fit your environment.

Once the service is bound to the application, the connector's settings will be available in `VCAP_SERVICES`.

For the settings to be available in the configuration, use the Cloud Foundry configuration provider by adding `AddCloudFoundry()` to the `ConfigurationBuilder`:

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            // Add `VCAP_` configuration info
            .AddCloudFoundry()

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings from the service binding will merge with the settings from other configuration mechanisms (e.g. `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration will take precedence and override all others.

> Note: If you are using the Spring Cloud Config Server, `AddConfigServer()` will automatically call `AddCloudFoundry()` for you

### 5.2.4 Add IDistributedCache

 To use Microsoft's `IDistributedCache` in your application, add it to the service container:

 ```csharp
using Steeltoe.CloudFoundry.Connector.Redis;
public class Startup {
    public IConfigurationRoot Configuration { get; private set; }
    public Startup()
    {
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Microsoft Redis Cache (IDistributedCache) configured from Cloud Foundry
        services.AddDistributedRedisCache(Configuration);

        // Add framework services
        services.AddMvc();
    }
```

The `AddDistributedRedisCache(Configuration)` method call configures the `IDistributedCache` using the configuration built by the application earlier and adds the connection to the service container.

### 5.2.5 Use IDistributedCache

 This example shows how to inject and use the `IDistributedCache` in a controller once it has been added to the service container:

 ```csharp
 using Microsoft.Extensions.Caching.Distributed;
 ...
 public class HomeController : Controller
 {
     private IDistributedCache _cache;
     public HomeController(IDistributedCache cache)
     {
         _cache = cache;
     }
     ...
     public IActionResult CacheData()
     {
         string key1 = Encoding.Default.GetString(_cache.Get("Key1"));
         string key2 = Encoding.Default.GetString(_cache.Get("Key2"));

         ViewData["Key1"] = key1;
         ViewData["Key2"] = key2;

         return View();
     }
 }
 ```

### 5.2.6 Add IConnectionMultiplexer

To use a StackExchange `IConnectionMultiplexer` in your application directly, add it to the service container in the `ConfigureServices()` method of the `Startup` class:

 ```csharp
using Steeltoe.CloudFoundry.Connector.Redis;

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {

        // Add StackExchange IConnectionMultiplexer configured from Cloud Foundry
        services.AddRedisConnectionMultiplexer(Configuration);

        // Add framework services
        services.AddMvc();
        ...
    }
    ...
```

The `AddRedisConnectionMultiplexer(Configuration)` method call configures the `IConnectionMultiplexer` using the configuration built by the application and adds the connection to the service container.

> Note: you can use both `IDistributedCache` and `IConnectionMultiplexer` in your application if you need to.

### 5.2.7 Use IConnectionMultiplexer

Once you have configured and added the `IConnectionMultiplexer` to the service container, inject and use it in a controller or a view:

 ```csharp
 using Microsoft.Extensions.Caching.Distributed;
 ...
 public class HomeController : Controller
 {
     private IConnectionMultiplexer _conn;
     public HomeController(IConnectionMultiplexer conn)
     {
         _conn = conn;
     }
     ...
      public IActionResult ConnData()
    {
        IDatabase db = _conn.GetDatabase();

        string key1 = db.StringGet("ConnectionMultiplexerKey1");
        string key2 = db.StringGet("ConnectionMultiplexerKey2");

        ViewData["ConnectionMultiplexerKey1"] = key1;
        ViewData["ConnectionMultiplexerKey2"] = key2;

        return View();
    }
 }
 ```

# 6.0 OAuth

This connector simplifies using Cloud Foundry OAuth2 security services (e.g. [UAA Server](https://github.com/cloudfoundry/uaa) or [Pivotal Single Sign-on](https://docs.pivotal.io/p-identity/)) by exposing the Cloud Foundry OAuth service configuration data as injectable `IOption<OAuthServiceOptions>`. It is used by the [Cloud Foundry External Security Providers](../steeltoe-security), but can be used separately.

## 6.1 Quick Start

This quick start consists of an ASP.NET Core sample app illustrating how to use the OAuth Connector to expose the binding information provided by the Cloud Foundry UAA Server.

### 6.1.1 Locate Sample

```bash
> cd Samples/Connectors/src/AspDotNetCore/OAuth
```

### 6.1.2 Create Service

You must first create an instance of a OAuth2 service in a org/space. There are two to choose from, but in this quick start we will use the UAA Server.

To set up UAA, we need to create a user-provided service that will provide the appropriate UAA server configuration data to the application.

> Note: the contents of `oauth.json` must be modified to match your Cloud Foundry configuration.

```bash
> # Create a OAuth service instance on Cloud Foundry
> cf cups myOAuthService -p oauth.json
>
> # Make sure the service is ready
> cf services
```

### 6.1.3 Publish Sample

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

### 6.1.4 Push Sample

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

> Note: the manifests have been defined to bind the application to `myOAuthService` created above.

### 6.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs oauth`)

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

### 6.1.6 What to expect

At this point the app is up and running.

On the apps menu, click on the `OAuth Options` menu item to see meaningful configuration data for the bound OAuth service.

### 6.1.7 Understand Sample

The sample was created using the .NET Core tooling `mvc` template (i.e. `dotnet new mvc`)  and then modified to use the Steeltoe frameworks.

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

* `OAuth.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.CloudFoundry.ConnectorCore`
* `Program.cs` - Code added to read the `--server.urls` command line.
* `Startup.cs` - Code added to the `ConfigureServices()` method to add a `OAuthServiceOptions` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry UAA configuration values when pushed to Cloud Foundry.
* `HomeController.cs` - Code added for injection of a `OAuthServiceOptions` into the Controller. The `OAuthServiceOptions` contains the binding information from Cloud Foundry.
* `OAuthOptions.cshtml` - The view used to display the OAuth data.

## 6.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay attention to the usage of the `ConfigureServices()` method.

You probably will want some understanding of Cloud Foundry OAuth2 security services (e.g. [UAA Server](https://github.com/cloudfoundry/uaa) or [Pivotal Single Sign-on](https://docs.pivotal.io/p-identity/)) before starting to use this connector.

To use this Connector:

* Create and bind an OAuth service instance to your application.
* Configure any additional settings the OAuth connector will need. (Optional)
* Add Steeltoe Cloud Foundry configuration provider to your ConfigurationBuilder.
* Add OAuth connector to your ServiceCollection.
* Access the OAuth service options.

### 6.2.1 Add NuGet Reference

To use the connector, you need to add a reference to the appropriate Steeltoe Connector NuGet package. If your application uses Microsoft's Dependency Injection, use the `Steeltoe.CloudFoundry.ConnectorCore` package. If you do not use Microsoft's Dependency Injection, use `Steeltoe.CloudFoundry.ConnectorBase`.

Use the NuGet Package Manager tools or directly add the following package references to your .csproj file to include the Steeltoe connector library:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CloudFoundry.ConnectorCore" Version= "2.0.0-rc1"/>
...
</ItemGroup>
```

### 6.2.2 Configure Settings

Configuring additional settings for the connector is not typically required, but when Cloud Foundry is using self-signed certificates you might need to disable certificate validation:

```json
{
  ...
  "security": {
    "oauth2": {
      "client": {
        "validateCertificates": false
      }
    }
  }
  ...
}
```

### 6.2.3 Cloud Foundry

There are multiple ways to setup OAuth services on Cloud Foundry.

In the quick start above, we used a user-provided service to define a direct binding to the Cloud Foundry UAA server. Alternatively, you can use the [Pivotal Single Sign-on](https://docs.pivotal.io/p-identity/)) product to provision an OAuth service binding. The process to create service binding varies for each of the approaches.

Regardless of which you choose, once the service is bound to your application, the connector's settings will be available in `VCAP_SERVICES`. For the settings to available in the configuration, use the Cloud Foundry configuration provider by adding `AddCloudFoundry()` to the `ConfigurationBuilder`:

```csharp
public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(IHostingEnvironment env)
    {
        // Set up configuration sources.
        var builder = new ConfigurationBuilder()
            .SetBasePath(env.ContentRootPath)

            // Read in Connectors configuration
            .AddJsonFile("appsettings.json")

            // Add `VCAP_` configuration info
            .AddCloudFoundry()

            .AddEnvironmentVariables();

        Configuration = builder.Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings from the service binding will merge with the settings from other configuration mechanisms (e.g. `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration will take precedence and override all others.

> Note: If you are using the Spring Cloud Config Server, `AddConfigServer()` will automatically call `AddCloudFoundry()` for you

### 6.2.4 Add OAuthServiceOptions

Once the OAuth service has been bound to the application, add the OAuth connector to your service collection in the `ConfigureServices()` method of the `Startup` class:

```csharp
using Steeltoe.CloudFoundry.Connector.OAuth;

public class Startup {
    ...
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      ...
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Configure and Add IOptions<OAuthServiceOptions> to the container
        services.AddOAuthServiceOptions(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ...
```

The `AddOAuthServiceOptions(Configuration)` method call configures a `OAuthServiceOptions` instance using the configuration built by the application and adds it to the service container.

### 6.2.5 Use OAuthServiceOptions

 Finally, inject and use the configured `OAuthServiceOptions` into a controller:

 ```csharp
 using Steeltoe.CloudFoundry.Connector.OAuth;
 ...
 public class HomeController : Controller
 {
     OAuthServiceOptions _options;

     public HomeController(IOptions<OAuthServiceOptions> oauthOptions)
     {
         _options = oauthOptions.Value;
     }
     ...
     public IActionResult OAuthOptions()
     {
         ViewData["ClientId"] = _options.ClientId;
         ViewData["ClientSecret"] = _options.ClientSecret;
         ViewData["UserAuthorizationUrl"] = _options.UserAuthorizationUrl;
         ViewData["AccessTokenUrl"] = _options.AccessTokenUrl;
         ViewData["UserInfoUrl"] = _options.UserInfoUrl;
         ViewData["TokenInfoUrl"] = _options.TokenInfoUrl;
         ViewData["JwtKeyUrl"] = _options.JwtKeyUrl;
         ViewData["ValidateCertificates"] = _options.ValidateCertificates;
         ViewData["Scopes"] = CommaDelimit(_options.Scope);

         return View();
     }
 }
 ```