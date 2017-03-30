---
title: Connectors
date: 2016/3/1
tags:
---

Steeltoe Connectors are intended to simplify the process of connecting and using services on CloudFoundry. Steeltoe Connectors provide a simple abstraction for .NET based applications running on Cloud Foundry enabling them to discover bound services together with the deployment information at runtime. The connectors also provide support for registering the services as inject-able service objects. 
                                                                                           
The Steeltoe Connectors provide out-of-the-box support for discovering many common services on Cloud Foundry. They also include the ability to use settings based configuration so developers can supply configuration settings at development and testing time,  but then have those settings overridden when pushing the application to Cloud Foundry.

All connectors use configuration information from Cloud Foundry's `VCAP_SERVICES` environment variable to detect and configure the available services. This a Cloud Foundry standard that is used  to hold connection and identification information for all service instances that have been bound to Cloud Foundry applications. 

For more information on `VCAP_SERVICES` see the Cloud Foundry [documentation](https://docs.cloudfoundry.org/).

### 1.0 MySQL 

This connector simplifies using [Connector/NET](https://dev.mysql.com/doc/connector-net/en/) in an application running on CloudFoundry. You probably will want some understanding of how to use it before proceeding to use the connector. 

In addition to the Quick Start below, there are several other Steeltoe sample applications that you can refer to in order to help you understand how to make use of this connector:

* [AspDotNet4/MySql4](https://github.com/SteeltoeOSS/Samples/tree/master/Connectors/src/AspDotNet4/MySql4) - same as the Quick Start below, but built for ASP.NET 4.x.
* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) -  a sample app illustrating how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core MusicStore reference app provided by Microsoft.
* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ) - a polyglot (i.e. Java and .NET) micros-services based sample app illustrating inter-operability between Java and .NET based micro-services running on CloudFoundry, secured with OAuth2 Security Services and using Spring Cloud Services. 
                                                                                    
The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

#### 1.1 Quick Start
This quick start consists of using several ASP.NET Core sample applications to illustrate how to use the Steeltoe MySql Connector for connecting to a MySql service on CloudFoundry.

There are three sample applications you can choose from for this quick start:

 * MySql - illustrates how to use a `MySqlConnection` to issue commands to the bound database.
 * MySqlEF6 - illustrates how to use a Entity Framework 6 `DbContext` to access the bound database.
 * MySqlEFCore - illustrates how to use a Entity Framework Core `DbContext` to access the bound database.
 

##### 1.1.1 Get Sample
Depending on your specific interests, pick one of the following samples to work with going forward. 

```
> git clone https://github.com/SteeltoeOSS/Samples.git
>
> # Use a `MySqlConnection` sample
> cd Samples/Connectors/src/AspDotNetCore/MySql
>
> # Use a Entity Framework 6 `DbContext` sample
> cd Samples/Connectors/src/AspDotNetCore/MySqlEF6
>
> # Use a Entity Framework Core `DbContext` sample
> cd Samples/Connectors/src/AspDotNetCore/MySqlEFCore
```

##### 1.1.2 Create Service

In this step, use the Cloud Foundry CLI to create a service instance of MySql on Cloud Foundry.  

The commands below assume you are using the MySql service provided by Pivotal on Cloud Foundry. 

If you are using a different service then you will have to adjust the `create-service` command below to fit your setup.

```
> # Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
> # Create a MySql service instance on Cloud Foundry
> cf create-service p-mysql 100mb myMySqlService
>
> # Make sure the service is ready
> cf services 
```

##### 1.1.3 Publish Sample
Use the `dotnet` CLI to build and publish the application to the folder `publish`. 

Note that not all quick start samples can be built to run on all frameworks and run-times.  

For example, the Entity Framework 6 DbContext sample can only run on Windows and on the .NET Framework, and the Entity Framework Core DbContext sample can only run on .NET Core.

```
> dotnet restore --configfile nuget.config
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
> 
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64
>  
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net462 -r win10-x64  
```

##### 1.1.4 Push Sample 
Use the Cloud Foundry CLI to push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the application to `myMySqlService` created above.

##### 1.1.5 Observe Logs
To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs mysqlefcore-connector`, `cf logs mysqlef6-connector` or  `cf logs mysql-connector`)

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

##### 1.1.6 What to expect

At this point the application is up and running. Upon startup it inserts a couple rows into the bound MySql database. 

To display those rows click on the `MySql Data` link in the top menu and you should see the row data displayed.

##### 1.1.7 Understand Sample

Each of the samples were created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) . 

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

 * `MySql.csproj`, `MySqlEF6.csproj`, `MySqlEFCore.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry` and also one for `Steeltoe.CloudFoundry.Connector.MySql`
 * `Program.cs` - Code added to read the `--server.urls` command line
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add a `MySqlConnection` or a `DbContext`, depending on the application, to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry MySql configuration values when pushed to Cloud Foundry.
 * `HomeController.cs` - Code added for injection of a `MySqlConnection` or `DbContext` into the Controller.  These are used to obtain data from the database and then to display the data.
 * `MySqlData.cshtml` - The view used to display the MySql data values.
 * `Models folder` - Contains code to initialize the database and also the definition of `DbContexts` classes for the MySqlEF6 and MySqlEFCore samples.
  
#### 1.2 Usage
You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()` method. 

To use this connector you need to do the following:

* Create and bind a MySql Service instance to your application.
* Optionally, configure any MySql client settings (e.g. `appsettings.json`) you need.
* Add Steeltoe CloudFoundry configuration provider to your `ConfigurationBuilder`.
* Add `MySqlConnection` or `DbContext` to your `IServiceCollection`.

##### 1.2.1 Add NuGet Reference

To make use of this connector, you need to add a reference to the Steeltoe MySql connector NuGet.  

The connector can be found in the `Steeltoe.CloudFoundry.Connector.MySql` package.

Add the connector to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CloudFoundry.Connector.MySql" Version= "1.0.0"/>
...
</ItemGroup>
```

##### 1.2.2 Configure Settings

Optionally you can configure the settings the MySql connector will use when setting up a `MySqlConnection` to a database. This can be useful when you are developing and testing an application locally on your desktop and you need to have the connector configure the connection to an instance of MySql database running elsewhere.  

Here is an example MySql connector configuration in JSON that shows how to setup a connection to a database at `myserver:3306`: 

```
{
...
  "mysql": {
    "client": {
      "server": "myserver",
      "port": 3309
    }
  }
  .....
}
```

Below is a table showing all possible settings for the connector. 

As shown above, all of these settings should be prefixed with `mysql:client:`

|Key|Description|
|------|------|
|**server**|Hostname or IP Address of server, defaults = localhost|
|**port**|Port number of server, defaults = 3306|
|**username**|Username for authentication, defaults = empty|
|**password**|Password for authentication, default = empty|
|**database**|Schema to connect to, default = empty|
|**connectionString**|Full connection string, use instead of above individual settings|

Once the connectors settings have been defined and put in a file, then the next step is to get them read in so they can be made available to the connector. 

Using the code below, you can see that the connectors settings from above should be put in `appsettings.json` and included with the application. Then, by using the .NET provided JSON configuration provider we are able to read in the settings simply by adding the provider to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.  

```

public class Startup {
    .....
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
    ....
```

If you wanted to managed the settings centrally, you can also use the Spring Cloud Config Server (i.e. `AddConfigServer()`) instead of a local JSON file (i.e. `AddJsonFile()`) simply by putting the settings in a github repository and configuring the Config server to serve its configuration from that repository.

##### 1.2.3 Cloud Foundry

When you want to use MySql on Cloud Foundry and you have installed the MySql service, you can create and bind a instance of it to your application using the CloudFoundry CLI as follows:

```
> cf target -o myorg -s myspace
> # Create MySql service
> cf create-service p-mysql 100mb myMySqlService
> # Bind service to `myApp`
> cf bind-service myApp myMySqlService
> # Restage the app to pick up change
> cf restage myApp
```
Note: The commands above assume you are using the MySql service provided by Pivotal on Cloud Foundry. If you are using a different service then you will have to adjust the `create-service` command to fit your setup.

Once you have bound the service to your application, the connectors settings will become available and be setup in `VCAP_SERVICES`.
  
In order for the binding settings to be picked up and put in the configuration, you have to make use of the CloudFoundry configuration provider. 

To do that, simply add a `AddCloudFoundry(`) method call to the `ConfigurationBuilder`.  Here is an example:

```
public class Startup {
    .....
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
    ....
```
    
When you push the application to Cloud Foundry, the settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`). 

If there are merge conflicts, then the service binding settings will take precedence and will override all others.

>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 1.2.4 Add MySqlConnection
Now in order to use a `MySqlConnection` in your application, you need to add it to the service container.  You do this in the `ConfigureServices()` method of the `Startup` class. 

```
#using Steeltoe.CloudFoundry.Connector.MySql;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add MySqlConnection configured from Configuration
        services.AddMySqlConnection(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ....
```
The `AddMySqlConnection(Configuration)` method call above, configures the `MySqlConnection` using the configuration built by the application and it then adds the connection to the service container. 

##### 1.2.5 Use MySqlConnection
Once you have configured and added the connection to the service container, then its very easy to inject and use it in a controller or a view. 

Below is an example illustrating how to do this an then use it in a controller:


```
using MySql.Data.MySqlClient;
....
public class HomeController : Controller
{
    public HomeController()
    {
    }
    ...
    public IActionResult MySqlData(
        [FromServices] MySqlConnection dbConnection)
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

##### 1.2.6 Add DbContext
If you are using the Entity Framework, then you are going to want to use a `DbContext` in your application instead of a connection. 

To set this up, you need use the `AddDbContext<>()` method to add a `DbContext` instead of a `MySqlConnection`.  

Just like above, you do this in the `ConfigureServices(..)` method of the `Startup` class:

```
#using Steeltoe.CloudFoundry.Connector.MySql.EFCore
... OR
#using Steeltoe.CloudFoundry.Connector.MySql.EF6;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
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
    ....
```
The `AddDbContext<TestContext>(..)` method call configures the `TestContext` using the configuration built earlier and then adds the context (i.e. `TestContext`) to the service container.

You will define your `DbContext` differently, depending on whether you are using Entity Framework 6 or Entity Framework Core.  

Here are examples for both:

```
// ---------- EF6 DbContext ---------------
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
 
// ---------- EFCore DbContext ---------------
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

##### 1.2.7 Use DbContext

Once you have configured and added the context to the service container, then its very simple to inject and use it in a controller or a view. 

Here is an example illustrating this:

```
using Project.Models;
....
public class HomeController : Controller
{
    public HomeController()
    {
    }
    public IActionResult MySqlData(
        [FromServices] TestContext context)
    {

        var td = context.TestData.ToList();
        foreach (var d in td)
        {
            ViewData["Key" + d.Id] = d.Data;
        }

        return View();
    }

``` 


### 2.0 Postgres

This connector simplifies using [Npgsql](http://www.npgsql.org/) in an application running on CloudFoundry. You probably will want some understanding of how to use it before proceeding to use the connector.

The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

#### 2.1 Quick Start

This quick start consists of using several ASP.NET Core sample applications to illustrate how to use the Steeltoe Postgres Connector for connecting to a Postgres service on CloudFoundry.

There are two sample applications you can choose from for this quick start:

 * PostgreSql - illustrates how to use a `NpgsqlConnection` to issue commands to the bound database.
 * PostgreEFCore - illustrates how to use a Entity Framework Core `DbContext` to access the bound database.
 

##### 2.1.1 Get Sample
Depending on your specific interests, pick one of the following samples to work with going forward. 

```
> git clone https://github.com/SteeltoeOSS/Samples.git
>
> # Use a `NpgsqlConnection`
> cd Samples/Connectors/src/AspDotNetCore/PostgreSql
>
> # Use a Entity Framework Core `DbContext`
> cd Samples/Connectors/src/AspDotNetCore/PostgreEFCore
```

##### 2.1.2 Create Service

In this step, you will create a service instance of Postgres on Cloud Foundry.  

The commands below assume you are using the EDB Postgres service on Cloud Foundry. 

If you are using a different service then you will have to adjust the `create-service` command below to fit your setup.

```
> # Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
> # Create a Postgres service instance on Cloud Foundry
> cf create-service EDB-Shared-PostgreSQL "Basic PostgreSQL Plan" myPostgres
>
> # Make sure the service is ready
> cf services 
```

##### 2.1.3 Publish Sample
Use the `dotnet` CLI to build and publish the application to the folder `publish`.  

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```
> dotnet restore --configfile nuget.config
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
> 
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64
>  
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net462 -r win10-x64  
```

##### 2.1.4 Push Sample 
Use the Cloud Foundry CLI to push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the application to `myPostgres` created above.

##### 2.1.5 Observe Logs
To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs postgres-connector`)

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

##### 2.1.6 What to expect

At this point the app is up and running. Upon startup it inserts a couple rows into the bound Postgres database. 

To display those rows click on the `Postgres Data`` link in the top menu and you should see the row data displayed.

##### 2.1.7 Understand Sample

Each of the samples were created from the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) . 

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

 * `PostgreSql.csproj`, `PostgreEFCore.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry` and also one for `Steeltoe.CloudFoundry.Connector.PostgreSql`
 * `Program.cs` - Code added to read the `--server.urls` command line
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add a `NpgsqlConnection` or a `DbContext` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry Postgres configuration values when pushed to Cloud Foundry.
 * `HomeController.cs` - Code added for injection of a `NpgsqlConnection` or `DbContext` into the Controller.  These are used to obtain data from the database and then to display the data.
 * `PostgresData.cshtml` - The view used to display the Postres data values.
 * `Models folder` - contains code to initialize the database and also the `DbContext` for PostgreEFCore sample.
 
#### 2.2 Usage
You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()` method. 

To use this connector you need to do the following:

* Create and bind a Postgres Service instance to your application.
* Optionally, configure any Postgres client settings (e.g. `appsettings.json`)
* Add Steeltoe CloudFoundry config provider to your `ConfigurationBuilder`.
* Add `NpgsqlConnection` or `DbContext` to your `IServiceCollection`.

##### 2.2.1 Add NuGet Reference

To make use of this connector, you need to add a reference to the Steeltoe PostgreSql connector NuGet.  

The connector can be found in the `Steeltoe.CloudFoundry.Connector.PostgreSql` package.

Add the connector to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CloudFoundry.Connector.PostgreSql" Version= "1.0.0"/>
...
</ItemGroup>
```
##### 2.2.2 Configure Settings

Optionally you can configure the settings the connector will use when setting up the `NpgsqlConnection` to a database. This can be useful when you are developing and testing an application locally on your desktop and you need to have the connector configure the connection to an instance of Postgres database running elsewhere.  

Here is an example Postres connector configuration in JSON that shows how to setup a connection to a database at `myserver:5432`: 


```
{
...
  "postgres": {
    "client": {
      "host": "myserver",
      "port": 5432
    }
  }
  .....
}
```

Below is a table showing all possible settings for the connector. 

As shown above, all of these settings should be prefixed with `postgres:client:`.

|Key|Description|
|------|------|
|**server**|Hostname or IP Address of server, defaults = localhost|
|**port**|Port number of server, defaults = 5432|
|**username**|Username for authentication, defaults = empty|
|**password**|Password for authentication, default = empty|
|**database**|Schema to connect to, default = empty|
|**connectionString**|Full connection string, use instead of above individual settings|

Once the connectors settings have been defined and put in a file, then the next step is to get them read in so they can be made available to the connector. 

Using the code below, you can see that the connectors settings from above should be put in `appsettings.json` and included with the application. Then, by using the .NET provided JSON configuration provider we are able to read in the settings simply by adding the provider to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.   

```

public class Startup {
    .....
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
    ....
```

If you wanted to managed the settings centrally, you can also use the Spring Cloud Config Server (i.e. `AddConfigServer()`) instead of a local JSON file (i.e. `AddJsonFile()`) simply by putting the settings in a github repository and configuring the Config server to serve its configuration from that repository.


##### 2.2.3 CloudFoundry 
When you want to use Postgres on Cloud Foundry and you have installed a Postgres service, you can create and bind a instance of it to your application using the CloudFoundry CLI as follows:

```
> cf target -o myorg -s myspace
> # Create Postgres service
> cf create-service EDB-Shared-PostgreSQL "Basic PostgreSQL Plan" myPostgres
> # Bind service to `myApp`
> cf bind-service myApp myPostgres
> # Restage the app to pick up change
> cf restage myApp
```

Note: The commands above assume you are using the Postgres service provided by EDB on Cloud Foundry. If you are using a different service then you will have to adjust the `create-service` command to fit your setup.

Once you have bound the service to your application, the connectors settings will become available and be setup in `VCAP_SERVICES`.
  
In order for the binding settings to be picked up and put in the configuration, you have to make use of the CloudFoundry configuration provider. 

To do that, simply add a `AddCloudFoundry(`) method call to the `ConfigurationBuilder`.  Here is an example:

```
public class Startup {
    .....
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
    ....
```
    
When you push the application to Cloud Foundry, the settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`). 

If there are merge conflicts, then the service binding settings will take precedence and will override all others.
 
>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 2.2.4 Add PostresConnection

 If you want to use a `NpgsqlConnection` in your application, then you need to add it to your `IServiceCollection` .  
 
 You do this in the `ConfigureServices()` method of the `Startup` class. Here is some sample code illustrating how:
 
 ```
 #using Steeltoe.CloudFoundry.Connector.PostgreSql;
 
 public class Startup {
     .....
     public IConfigurationRoot Configuration { get; private set; }
     public Startup(...)
     {
       .....
     }
     public void ConfigureServices(IServiceCollection services)
     {
         // Add NpgsqlConnection configured from CloudFoundry
         services.AddPostgresConnection(Configuration);
 
         // Add framework services.
         services.AddMvc();
         ...
     }
     ..
 ```
 The `AddPostgresConnection(Configuration)` method call configures the `NpgsqlConnection` using the configuration built by the application earlier and it then adds the connection to the service container.

##### 2.2.5 Use NpgsqlConnection
 Once you have configured and added the connection to the service container, then its very easy to inject and use it in a controller or a view. 
 
 Below is an example illustrating how to use it in a controller:

```
using Npgsql;
....
public class HomeController : Controller
{
    public HomeController()
    {
    }
    ...
    public IActionResult PostgresData(
        [FromServices] NpgsqlConnection dbConnection)
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

##### 2.2.6 Add DbContext
If you would prefer to use a `DbContext` in your application, then you need to add it, instead of a `NpgsqlConnection` to your `IServiceCollection`.  

Just like above, you do this in the `ConfigureServices()` method of the `Startup` class:

```
#using Steeltoe.CloudFoundry.Connector.PostgreSql.EFCore;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {

        // Add EFCore TestContext configured with a Postgres configuration
        services.AddDbContext<TestContext>(options => options.UseNpgsql(Configuration));

        // Add framework services.
        services.AddMvc();
        ...
    }
    ..
```

The `AddDbContext<TestContext>(options => options.UseNpgsql(Configuration));` method call configures the `TestContext` using the configuration built by the application and it then adds the context to the service container.

Here is how you would define the `DbContext`:

```
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

##### 2.2.7 Use DbContext
Once you have configured and added the context to the service container, then its very simple to inject and use it in a controller or a view. 

Here is an example on how to do that:

```
using Project.Models;
....
public class HomeController : Controller
{
    public HomeController()
    {
    }
    public IActionResult PostgresData(
            [FromServices] TestContext context)
    {

        var td = context.TestData.ToList();
        foreach (var d in td)
        {
            ViewData["Key" + d.Id] = d.Data;
        }

        return View();
    }
}
``` 

### 3.0 RabbitMQ
This connector simplifies using the [RabbitMQ Client](https://www.rabbitmq.com/tutorials/tutorial-one-dotnet.html) in an application running on CloudFoundry. You probably will want some understanding of how to use it before proceeding to use the connector. 
                                                                                                       
The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

#### 3.1 Quick Start

This quick start consists of using an ASP.NET Core sample application which illustrates how to use the Steeltoe Rabbit Connector for connecting to a RabbitMQ service on CloudFoundry.  

Specifically it shows how to use a `RabbitMQ.Client` to send and receive messages on the bound RabbitMQ service.

##### 3.1.1 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Connectors/src/AspDotNetCore/Rabbit
```

##### 3.1.2 Create Service

In this step,  use the Cloud Foundry CLI to create a service instance of Rabbit on Cloud Foundry.  

The commands below assume you are using the Rabbit service provided by Pivotal on Cloud Foundry. 

If you are using a different service then you will have to adjust the `create-service` command below to fit your setup.

```
> # Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
> # Create a RabbitMQ service instance on Cloud Foundry
> cf create-service p-rabbitmq standard myRabbitService 
>
> # Make sure the service is ready
> cf services 
```

##### 3.1.3 Publish Sample
Use the `dotnet` CLI to build and publish the application to the folder `publish`.  

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```
> dotnet restore --configfile nuget.config
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
> 
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64
>  
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net462 -r win10-x64  
```

##### 3.1.4 Push Sample 
Use the Cloud Foundry CLI to push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the application to `myRabbitService` created above.

##### 3.1.5 Observe Logs
To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs rabbit`)

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

##### 3.1.6 What to expect

At this point the app is up and running. 

To send a message click "Send" and send a message over RabbitMQ. 

Having sent a message, click "Receive" and you will start seeing those messages.

##### 3.1.7 Understand Sample

The sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) . 

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

 * `Rabbit.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry` and also one for `Steeltoe.CloudFoundry.Connector.Rabbit`
 * `Program.cs` - Code added to read the `--server.urls` command line
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add a Rabbit `ConnectionFactory` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry RabbitMQ configuration values when pushed to Cloud Foundry.
 * `RabbitController.cs` - Code added for injection of a Rabbit `ConnectionFactory` into the Controller. The `ConnectionFactory` is used in the `Send` and `Receive` action methods.
 * `Receive.cshtml` - The view used to display the received message data values.
 * `Send.cshtml` - The view used to submit message data.
 
#### 3.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()` method.

You probably will want some understanding of how to use the [RabbitMq Client](https://www.rabbitmq.com/tutorials/tutorial-one-dotnet.html) before starting to use this connector. 
                                                       
In order to use this Connector you need to do the following:

 * Create and bind a Rabbit Service instance to your application.
 * Optionally, configure any Rabbit client settings (e.g. appsettings.json)
 * Add Steeltoe CloudFoundry config provider to your ConfigurationBuilder.
 * Add Rabbit ConnectionFactory to your ServiceCollection.


##### 3.2.1 Add NuGet Reference
To make use of the connector, you need to add a reference to the Steeltoe Rabbit connector NuGet. 

The connector can be found in the `Steeltoe.CloudFoundry.Connector.Rabbit` package.

Add the connector to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CloudFoundry.Connector.Rabbit" Version= "1.0.0"/>
...
</ItemGroup>
```

##### 3.2.2 Configure Settings

Optionally you can configure the settings the connector will use when setting up the Rabbit ConnectionFactory. This can be useful when you are developing and testing an application locally on your desktop and you need to have the connector configure the connection to an instance of a RabbitMQ server running elsewhere.  

Here is an example of the connectors configuration in JSON that shows how to setup a connection to a Rabbit server at `amqp://guest:guest@127.0.0.1/`.

```
{
...
  "rabbit": {
    "client": {
      "uri": "amqp://guest:guest@127.0.0.1/"
    }
  }
  .....
}
```

Below is a table showing all possible settings for the connector. 

As shown above, all of these settings should be prefixed with `rabbit:client:`.

|Key|Description|
|------|------|
|**server**|Hostname or IP Address of server, defaults = 127.0.0.1|
|**port**|Port number of server, defaults = 5672|
|**username**|Username for authentication, defaults = empty|
|**password**|Password for authentication, default = empty|
|**virtualHost**|Virtual host to connect to, default = empty|
|**uri**|Full connection string, use instead of above individual settings, default = empty|


Once the connectors settings have been defined and put in a file, then the next step is to get them read in so they can be made available to the connector. 

Using the code below, you can see that the connectors settings from above should be put in `appsettings.json` and included with the application. Then, by using the .NET provided JSON configuration provider we are able to read in the settings simply by adding the provider to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.  

```

public class Startup {
    .....
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
    ....
```

If you wanted to managed the settings centrally, you can also use the Spring Cloud Config Server (i.e. `AddConfigServer()`) instead of a local JSON file (i.e. `AddJsonFile()`) simply by putting the settings in a github repository and configuring the Config server to serve its configuration from that repository.

##### 3.2.3 CloudFoundry 
When you want to use RabbitMQ on Cloud Foundry and you have installed a Rabbit service, you can create and bind an instance of it to your application using the CloudFoundry CLI as follows:

```
> cf target -o myorg -s myspace
> # Create Rabbit service
>cf create-service p-rabbitmq standard myRabbitService
> # Bind service to `myApp`
> cf bind-service myApp myRabbitService
> # Restage the app to pick up change
> cf restage myApp
```

Note: The commands above assume you are using the Rabbit service provided by Pivotal on Cloud Foundry. If you are using a different service then you will have to adjust the `create-service` command to fit your setup.

Once you have bound the service to your application, the connectors settings will become available and be setup in `VCAP_SERVICES`.
  
In order for the binding settings to be picked up and put in the configuration, you have to make use of the CloudFoundry configuration provider. 

To do that, simply add a `AddCloudFoundry(`) method call to the `ConfigurationBuilder`.  Here is an example:

```
public class Startup {
    .....
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
    ....
```
    
When you push the application to Cloud Foundry, the settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`). 

If there are merge conflicts, then the service binding settings will take precedence and will override all others.
 
>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 3.2.4 Add Rabbit ConnectionFactory

If you want to use a Rabbit `ConnectionFactory` in your application, then you need to add it to the service container .  You do this in the `ConfigureServices()` method of the `Startup` class. 
 
Here is some sample code illustrating how:

```
#using Steeltoe.CloudFoundry.Connector.Rabbit;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Rabbit ConnectionFactory configured from CloudFoundry
        services.AddRabbitConnection(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ....
```
##### 3.2.5 Use Rabbit ConnectionFactory
Once you have configured and added the Rabbit `ConnectionFactory` to the service container, then its very simple to inject and use it in a controller or a view. 

Below is an example illustrating this:
 
 
 ```
using RabbitMQ.Client;
 ....
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

### 4.0 Redis

 This connector simplifies using a Microsoft [RedisCache](https://github.com/aspnet/Caching/tree/dev/src/Microsoft.Extensions.Caching.Redis) and/or a StackExchange [IConnectionMultiplexer](https://github.com/StackExchange/StackExchange.Redis) in an application running on CloudFoundry.

 In addition to the Quick Start below, there are other Steeltoe sample applications that you can use to help you understand how to make use of this connector:
* [DataProtection](https://github.com/SteeltoeOSS/Samples/tree/master/Security/src/RedisDataProtectionKeyStore) - sample app illustrating how to make use of the Steeltoe DataProtection Key Storage Provider for Redis.
* [MusicStore](https://github.com/SteeltoeOSS/Samples/tree/master/MusicStore) -  a sample app illustrating how to use all of the Steeltoe components together in a ASP.NET Core application. This is a micro-services based application built from the ASP.NET Core reference app MusicStore provided by Microsoft.

The source code for this connector can be found [here](https://github.com/SteeltoeOSS/Connectors).

#### 4.1 Quick Start
This quick start consists of using a ASP.NET Core sample application to illustrate how to use the Steeltoe Redis Connector for connecting to a Redis service on CloudFoundry. 

##### 4.1.1 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Connectors/src/AspDotNetCore/Redis
```

##### 4.1.2 Create Service

In this step, use the Cloud Foundry CLI to create a service instance of Redis on Cloud Foundry.  

The commands below assume you are using the Redis service provided by Pivotal on Cloud Foundry. 

If you are using a different service then you will have to adjust the `create-service` command below to fit your setup.

```
> # Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
> # Create a Redis service instance on Cloud Foundry
> cf create-service p-redis shared-vm myRedisService
>
> # Make sure the service is ready
> cf services 
```

##### 4.1.3 Publish Sample
Use the `dotnet` CLI to build and publish the application to the folder `publish`.  

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```
> dotnet restore --configfile nuget.config
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
> 
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64
>  
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net462 -r win10-x64  
```

##### 4.1.4 Push Sample 
Use the Cloud Foundry CLI to push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the application to `myRedisService` created above.

##### 4.1.5 Observe Logs
To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs redis-connector`)

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

##### 4.1.6 What to expect

At this point the app is up and running. Upon startup the app inserts a key/values into the bound Redis Cache.

To display those values click on the Cache Data link in the menu and you should see the key/values displayed using the Microsoft RedisCache.

You can click on the ConnectionMultiplexer Data link to view data using the StackExchange CollectionMultiplexer.

##### 4.1.7 Understand Sample

The sample was created from the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) . 

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

 * `Redis.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry` and also one for `Steeltoe.CloudFoundry.Connector.Redis`
 * `Program.cs` - Code added to read the `--server.urls` command line.
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add a `IDistributedCache` and a `IConnectionMultiplexer` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry Redis service configuration values when pushed to Cloud Foundry.
 * `HomeController.cs` - Code added for injection of a `IDistributedCache` or `IConnectionMultiplexer` into the Controller.  These are used to obtain data from the cache and then to display it.
 * `CacheData.cshtml` - The view used to display the Redis data values obtained using `IDistributedCache`.
 * `ConnData.cshtml` - The view used to display the Redis data values obtained using `IConnectionMultiplexer`.
 * `Models folder`- contains code to initialize the Redis cache.
 
#### 4.2 Usage
You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()` method.

You probably will want some understanding of how to use the [RedisCache](https://github.com/aspnet/Caching/tree/dev/src/Microsoft.Extensions.Caching.Redis) and/or [ConnectionMultiplexer](https://github.com/StackExchange/StackExchange.Redis/blob/master/Docs/Basics.md) before starting to use this connector. 

In order to use this connector you need to do the following:

* Create and bind a Redis Service instance to your application.
* Optionally, configure any Redis client settings (e.g. appsettings.json)
* Add Steeltoe CloudFoundry config provider to your ConfigurationBuilder.
* Add DistributedRedisCache and/or ConnectionMultiplexer to your ServiceCollection.

##### 4.2.1 Add NuGet Reference

To make use of the connector, you need to add a reference to the Steeltoe Redis connector NuGet.  

The connector can be found in the `Steeltoe.CloudFoundry.Connector.Redis` package.

Add the connector to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CloudFoundry.Connector.Redis" Version= "1.0.0"/>
...
</ItemGroup>
```

##### 4.2.2 Configure Settings

Optionally you can configure the settings the connector will use when setting up the RedisCache. This can be useful when you are developing and testing an application locally on your desktop and you need to have the connector configure the connection to an instance of a RabbitMQ server running elsewhere. 

Here is an example of the connectors configuration in JSON that shows how to setup a connection to a Redis server at `http://foo.bar:1111`

```
{
...
  "redis": {
    "client": {
      "host": "http://foo.bar",
      "port": 1111
    }
  }
  .....
}
```

Below is a table showing all possible settings for the connector.

As shown above, all of these settings should be prefixed with `redis:client:`.

|Key|Description|
|------|------|
|**host**|Hostname or IP Address of server, defaults = localhost|
|**port**|Port number of server, defaults = 6379|
|**endPoints**|Comma separated list of host:port pairs, defaults empty|
|**clientName**|Identification for the connection within redis, defaults = empty|
|**connectRetry**|Times to repeat initial connect attempts, default = 3|
|**connectTimeout**|Timeout (ms) for connect operations, default = 5000|
|**abortOnConnectFail**|Will not create a connection while no servers are available, default = true|
|**keepAlive**|Time (seconds) at which to send a message to help keep sockets alive, default = -1|
|**resolveDns**|DNS resolution should be explicit and eager, rather than implicit, default = false|
|**ssl**|SSL encryption should be used, default = false|
|**sslHost**|Enforces a particular SSL host identity on the server's certificate, default = empty|
|**writeBuffer**|Size of the output buffer, default = 4096|
|**connectionString**|Connection string, use instead of values above, default = empty|
|**instanceI**d|Cache id, used only with IDistributedCache, default = empty|


Once the connectors settings have been defined and put in a file, then the next step is to get them read in so they can be made available to the connector. 

Using the code below, you can see that the connectors settings from above should be put in `appsettings.json` and included with the application. Then, by using the .NET provided JSON configuration provider we are able to read in the settings simply by adding the provider to the configuration builder (e.g. `AddJsonFile("appsettings.json"))`.  

```

public class Startup {
    .....
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
    ....
```

If you wanted to managed the settings centrally, you can also use the Spring Cloud Config Server (i.e. `AddConfigServer()`) instead of a local JSON file (i.e. `AddJsonFile()`) simply by putting the settings in a github repository and configuring the Config server to serve its configuration from that repository.

##### 4.2.3 CloudFoundry

When you want to use Redis on Cloud Foundry and you have installed a Redis service, you can create and bind an instance of it to your application using the CloudFoundry CLI as follows:

```
> cf target -o myorg -s myspace
> # Create Redis service
> cf create-service p-redis shared-vm myRedisCache
> # Bind service to `myApp`
> cf bind-service myApp myRedisCache
> # Restage the app to pick up change
> cf restage myApp
```

Note: The commands above assume you are using the Rabbit service provided by Pivotal on Cloud Foundry. If you are using a different service then you will have to adjust the `create-service` command to fit your setup.

Once you have bound the service to the application, the connectors settings will become available and be setup in `VCAP_SERVICES`.
  
In order for the binding settings to be picked up and put in the configuration, you have to make use of the CloudFoundry configuration provider. 

To do that, simply add a `AddCloudFoundry(`) method call to the `ConfigurationBuilder`.  Here is an example:

```
public class Startup {
    .....
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
    ....
```
    
When you push the application to Cloud Foundry, the settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`). 

If there are merge conflicts, then the service binding settings will take precedence and will override all others.
 
>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 4.2.4 Add IDistributedCache

 If you want to use the Microsoft provided `IDistributedCache` in your application, then you need to add it to the service container .  
 
 You do this in the the `ConfigureServices()` method of the `Startup` class. Here is some sample code illustrating how:
 
 ```

 #using Steeltoe.CloudFoundry.Connector.Redis;
 
 public class Startup {
  
     public IConfigurationRoot Configuration { get; private set; }
     public Startup()
     {
 
     }
     public void ConfigureServices(IServiceCollection services)
     {
         // Add Microsoft Redis Cache (IDistributedCache) configured from CloudFoundry
         services.AddDistributedRedisCache(Configuration);
 
         // Add framework services
         services.AddMvc();
     }

```
The above `AddDistributedRedisCache(Configuration)` method call configures the `IDistributedCache` using the configuration built by the application earlier and it then adds the connection to the service container.

##### 4.2.5 Use IDistributedCache

 Below is an example illustrating how to inject and then use the `IDistributedCache` in a controller once its been added to the service container.  
 
 ```
 using Microsoft.Extensions.Caching.Distributed;
 ....
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
 
##### 4.2.6 Add IConnectionMultiplexer

If you would prefer to use a StackExchange `IConnectionMultiplexer` in your application, then you need to add it, instead of a `DistributedRedisCache` to the service container.  

Just like above, you do this in the `ConfigureServices()` method of the `Startup` class:

```
#using Steeltoe.CloudFoundry.Connector.Redis;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {

        // Add StackExchange IConnectionMultiplexer configured from CloudFoundry
        services.AddRedisConnectionMultiplexer(Configuration);

        // Add framework services
        services.AddMvc();
        ...
    }
    ....
```
The above `AddRedisConnectionMultiplexer(Configuration)` method call configures the `IConnectionMultiplexer` using the configuration built by the application and it then adds the connection to the service container.


##### 4.2.7 Use IConnectionMultiplexer

Once you have configured and added the `ConnectionMultiplexer` to the service container, then its very simple to inject and use it in a controller or a view. 
  
 ```
 using Microsoft.Extensions.Caching.Distributed;
 ....
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

### 5.0 OAuth

This connector simplifies using CloudFoundry OAuth2 security services (e.g. [UAA Server](https://github.com/cloudfoundry/uaa) or [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)).

It exposes the CloudFoundry OAuth service configuration data as inject-able `IOption<OAuthServiceOptions>`. It primarily used by the ASP.NET Core [CloudFoundry External Security Provider](https://github.com/SteeltoeOSS/Security), but can be used standalone as well.

#### 5.1 Quick Start

This quick start consists of an ASP.NET Core sample app illustrating how to use the OAuth Connector to expose the binding information provided by the CloudFoundry UAA Server.

##### 5.1.1 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Connectors/src/AspDotNetCore/OAuth
```

##### 5.1.2 Create Service

You must first create an instance of a OAuth2 service in a org/space. As mentioned above there are a couple to choose from. In this quick start we will use the UAA Server as the provider of OAuth2 services.

To set this up, we need to create a CUPS service the will provide the appropriate UAA server configuration data as part of the binding information. 

To do this, you should use the provided `oauth.json` file when creating your CUPS service. 

Note, BEFORE proceeding you will need to edit its contents to match your CloudFoundry configuration.

```
> # Target and org and space in Cloud Foundry
> cf target -o myorg -s development
>
> # Create a OAuth service instance on Cloud Foundry
> cf cups myOAuthService -p oauth.json
>
> # Make sure the service is ready
> cf services 
```

##### 5.1.3 Publish Sample
Use the `dotnet` tool to build and publish the application to the folder `publish`

Note below we show how to publish for all of the target run times and frameworks the sample supports. Just pick one in order to proceed.

```
> dotnet restore --configfile nuget.config
>
> # Publish for Linux, .NET Core  
> dotnet publish -o publish  -f netcoreapp1.1 -r ubuntu.14.04-x64
> 
> # Publish for Windows, .NET Core 
> dotnet publish -o publish  -f netcoreapp1.1 -r win10-x64
>  
> # Publish for Windows, .NET Framework
> dotnet publish -o publish  -f net462 -r win10-x64  
```

##### 5.1.4 Push Sample 
Use the Cloud Foundry CLI to push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note that the manifests have been defined to bind the application to `myOAuthService` created above.

##### 5.1.5 Observe Logs
To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs oauth`)

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

##### 5.1.6 What to expect

At this point the app is up and running.

On the apps menu, click on the `OAuth Options` menu item and you should see meaningful configuration data for the bound OAuth service.

##### 5.1.7 Understand Sample

The sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) . 

To gain an understanding of the Steeltoe related changes to the generated template code,  examine the following files:

 * `OAuth.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry` and also one for `Steeltoe.CloudFoundry.Connector.OAuth`
 * `Program.cs` - Code added to read the `--server.urls` command line
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add a `OAuthServiceOptions` to the service container. Additionally, code was added to the `ConfigurationBuilder` in order to pick up Cloud Foundry UAA configuration values when pushed to Cloud Foundry.
 * `HomeController.cs` - Code added for injection of a `OAuthServiceOptions` into the Controller. The `OAuthServiceOptions` contains the binding information from CloudFoundry.
 * `OAuthOptions.cshtml` - The view used to display the OAuth data.

#### 5.2 Usage

You should have a good understanding of how the new .NET [Configuration service](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration) works before starting to use the connector. A basic understanding of the `ConfigurationBuilder` and how to add providers to the builder is necessary in order to configure the connector.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup) class is used in configuring the application services for the app. Specifically pay particular attention to the usage of the `ConfigureServices()` method.

You probably will want some understanding of CloudFoundry OAuth2 security services (e.g. [UAA Server](https://github.com/cloudfoundry/uaa) or [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)) before starting to use this connector.

In order to use this Connector you need to do the following:

 * Create and bind a OAuth service instance to your application.
 * Configure any additional settings the OAuth connector will need. (Optional)
 * Add Steeltoe CloudFoundry configuration provider to your ConfigurationBuilder.
 * Add OAuth connector to your ServiceCollection.
 * Access the OAuth service options.


##### 5.2.1 Add NuGet Reference
To make use of the connector, you need to add a reference to the Steeltoe OAuth connector NuGet.  

The connector can be found in the `Steeltoe.CloudFoundry.Connector.OAuth` package.

Add the connector to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CloudFoundry.Connector.OAuth" Version= "1.0.0"/>
...
</ItemGroup>
```

##### 5.2.2 Configure Settings

Typically you do not need to configure any additional settings for the connector.  

But, sometimes it might be necessary when running on CloudFoundry and you are using self-signed certificates.  In that case, you might need to disable certificate validation.

Here is an example on how to do that.

```
{
"Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Debug",
      "System": "Information",
      "Microsoft": "Information"
    }
  },
"security": {
    "oauth2": {
      "client": {
        "validate_certificates": false
      }
    }
  }
  .....
}
```

##### 5.2.3 CloudFoundry

There are multiple ways in which you can setup OAuth services on CloudFoundry. 

In the quick start above, we used a CUPS based service to define a direct binding to the Cloud Foundry UAA server. Alternatively, you can also make use of the [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)) product to provision a OAuth service binding. The process that you follow in creating service binding varies for each of the approaches. 

Regardless of which you choose, once you have bound the OAuth service to the application, the OAuth service settings will have been made available and setup in `VCAP_SERVICES` .

In order for the binding settings to be picked up and put in the configuration, you have to make use of the CloudFoundry configuration provider. 

To do that, simply to add a `AddCloudFoundry()` method call to the `ConfigurationBuilder`. Here is an example:

```
public class Startup {
    .....
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
    ....
```

When you push the application to Cloud Foundry, the settings that have been provided by the service binding will be merged with the settings that you have provided via other configuration mechanisms (e.g. `appsettings.json`). 

If there are merge conflicts, then the service binding settings will take precedence and will override all others.

>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 5.2.4 Add OAuthServiceOptions

Once the OAuth service has been bound to the application, then the next step is to add OAuth connector to your service collection.  Y

ou do this in the `ConfigureServices()` method of the `Startup` class:

```
#using Steeltoe.CloudFoundry.Connector.OAuth;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Configure and Add IOptions<OAuthServiceOptions> to the container
        services.AddOAuthServiceOptions(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ....
```
The `AddOAuthServiceOptions(Configuration)` method call configures a `OAuthServiceOptions` instance using the configuration built by the application and then adds it to the service container.

##### 5.2.6 Use OAuthServiceOptions

 The final step is to use the configured `OAuthServiceOptions`. 
 
 Below is an example illustrating how to use the dependency injection services to inject the information into a controller:
 
 
 ```
 using Steeltoe.CloudFoundry.Connector.OAuth;
 ....
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
         ViewData["Scopes"] = CommanDelimit(_options.Scope);
 
         return View();
     }
 }
 ``` 
