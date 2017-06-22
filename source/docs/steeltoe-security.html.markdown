---
title: Security
order: 50
date: 2016/2/1
tags:
---

Steeltoe provides a number of Security related services that simplify using Cloud Foundry based OAuth2 security services in ASP.NET Core applications.

These providers enable using the Cloud Foundry (e.g. [UAA Server](https://github.com/cloudfoundry/uaa) and/or [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)) for Authentication and Authorization credentials.

There are two providers to choose from when adding Cloud Foundry security integration:

* A provider that enables OAuth2 Single Sign-on with Cloud Foundry Security services.
* A provider that enables using JWT tokens issued by Cloud Foundry Security services for securing access to REST resources/endpoints.

In addition to the two providers above, Steeltoe also makes available an additional security provider which allows you to easily use a Cloud Foundry based Redis service for ASP.NET Core Data Protection Key Ring storage. By default, ASP.NET Core stores the key ring on the local file system. In a Cloud Foundry environment, this of course is un-workable and violates the twelve-factor guidelines for developing cloud native applications. Using the Steeltoe Redis Key Storage provider, you can reconfigure Data Protection service to use Redis on Cloud Foundry for storage. 

### 1.0 OAuth2 Single Sign-on

This provider, when used in an ASP.NET Core application, enables you to implement application log-in functionality using OAuth 2.0 and credentials provided from Cloud Foundry security services.

This enables you to leverage existing credentials configured in a UAA Server or a Pivotal Single Sign-on service for authentication and authorization.

In addition to the Quick Start below, there are other Steeltoe sample applications that you can use to help you understand how to make use of this provider:

* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ) - a polyglot (i.e. Java and .NET) micro-services based sample app illustrating inter-operability between Java and .NET based micro-services running on Cloud Foundry, secured with OAuth2 Security Services and using Spring Cloud Services.

The source code for this provider can be found [here](https://github.com/SteeltoeOSS/Security).

#### 1.1 Quick Start

This quick start makes use of a ASP.NET Core sample application to illustrate how to use the Steeltoe Cloud Foundry Single Signon provider for Authentication and Authorization against a Cloud Foundry UAA Server.

##### 1.1.1 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Security/src/CloudFoundrySingleSignon
```

##### 1.1.2 Get UAA CLI
Before creating the OAuth2 service instance, we first need to use the UAA command line tool to establish some security credentials for our sample app. 

To install the UAA command line tool and target it to your UAA server:

```
> gem install cf-uaac
```

##### 1.1.3 Get Admin Client Token

Next you need to authenticate and obtain an access token for the `admin client` from the UAA server so that you can add the quick start application and user credentials. 

You will need the `Admin Client Secret` for your installation of Cloud Foundry in order to accomplish this. 

If you are using Pivotal Cloud Foundry (PCF), you can obtain this from the `Ops Manager/Elastic Runtime` credentials page under the `UAA` section.  Look for `Admin Client Credentials` and then use it in the following:

```
> # Target the UAA on Cloud Foundry
> uaac target uaa.`YOUR-CLOUDFOUNDRY-SYSTEM-DOMAIN` (e.g. `uaac target uaa.system.testcloud.com`)
> # Obtain an Admin Client Access Token
> uaac token client get admin -s `ADMIN_CLIENT_SECRET`
```

##### 1.1.4 Add User and Group

Next you will need to add a new `user` and `group` to the UAA Server database. 

Do *not* change the group name: `testgroup` as that is used for policy based authorization in the quick start sample. Of course you can change the username and password to anything you would like.

```
> # Add group `testgroup`
> uaac group add testgroup
> # Add user `dave`
> uaac user add dave --given_name Dave --family_name Tillman --emails dave@testcloud.com --password Password1!
> # Add `dave` to `testgroup`
> uaac member add testgroup dave 
```
##### 1.1.5 Add Application Client

Once complete you are ready to add the quick start application as a new client to the UAA server. 

This will establish the applications credentials and enable it to interact with the UAA server. 

To do this you can use the line below, but you must replace the `YOUR-CLOUDFOUNDRY-APP-DOMAIN` with your Cloud Foundry setup domain.

```
> uaac client add myTestApp --scope cloud_controller.read,cloud_controller_service_permissions.read,openid,testgroup --authorized_grant_types authorization_code,refresh_token --authorities uaa.resource --redirect_uri http://single-signon.`YOUR-CLOUDFOUNDRY-APP-DOMAIN`/signin-cloudfoundry --autoapprove cloud_controller.read,cloud_controller_service_permissions.read,openid,testgroup --secret myTestApp
```

##### 1.1.6 Create Service

Last, you will need to create a CUPS based service which will be used to provide the appropriate UAA server configuration data to the application.

You should use the provided `credentials.json` file when creating the CUPS service, but you will FIRST need to edit it and replace the `YOUR-CLOUDFOUNDRY-SYSTEM-DOMAIN` with your Cloud Foundry setup domain. 

Once complete, do the following:

```
> cf target -o myorg -s development
> cf cups myOAuthService -p credentials.json
```


##### 1.1.7 Publish Sample 

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

##### 1.1.8 Push Sample

Use the Cloud Foundry CLI to target and push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> cf target -o myorg -s development
>
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note: The provided manifests will create an app named `single-signon` and attempt to bind it to the CUPS service `myOAuthService`.

##### 1.1.9 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs single-signon`)

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

##### 1.1.10 What to expect

At this point the app is up and running. You can access it at http://single-signon.`YOUR-CLOUDFOUNDRY-APP-DOMAIN`/.

On the apps menu, click on the `Log in` menu item and you should be redirected to the Cloud Foundry login page. Enter dave and Password1!, or whatever name/password you used above, and you should be authenticated and redirected back to the single-signon home page.

If you try and access the `About` menu item you should see the `About` page as user `dave` is a member of the group that is authorized to access the end point.

If you try and access the `Contact` menu item you should see `Access Denied, Insufficient permissions` as `dave` is not a member of `testgroup1` which is required in order to access the endpoint. 

If you access the `InvokeJwtSample` menu item, you will find the app will attempt to invoke a secured endpoint in a second Security sample app; `CloudFoundryJwtAuthentication`. In order for this menu item to be functional, you must first do the next Security Quick Start below. 

After completing the quick start below, and you have `CloudFoundryJwtAuthentication` up and running, then if you access the `InvokeJwtSample` menu item when you are logged in, you should see some `values` returned from the app.  If you are not logged in, then you will see a `401 (Unauthorized)` message.


##### 1.1.11 Understand Sample

The `CloudFoundrySingleSignon` sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) . 

To gain an understanding of the Steeltoe related changes to generated template code,  examine the following files:

 * `CloudFoundrySingleSignon.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry` and also one for `Steeltoe.Security.Authentication.CloudFoundry`
 * `Program.cs` - Code added to read the `--server.urls` command line
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add a `CloudFoundryAuthentication` to the service container. Code was also added to define two authorization policies; one requiring `testgroup` claim, and the other requiring `testgroup1` claim.  Additionally, in the `Configure()` method, the Steeltoe `CloudFoundryAuthentication` middleware was added to the request processing pipeline.
 * `HomeController.cs` - Several code changes were made to the controller:
  * `Login()` and `LogOff()` action methods were added
  * `InvokeJwtSample()` added to make REST call to `CloudFoundryJwtAuthentication`.  Code was added here to grab the `access_token` from `HttpContext` and provide it in the request to `CloudFoundryJwtAuthentication`.
  * `[Authorize(Policy = "testgroup")]` was added to the `About()` action
  * `[Authorize(Policy = "testgroup1")]` was added to the `Contact()` action
 * `Views folder` - Various view added for displaying results from the actions.

#### 1.2 Usage

This package is built on the OAuth 2 authentication flow and the services provided by ASP.NET Core Security. You should take some time to understand both, before proceeding to use this provider.

Many resources are available for understanding OAuth 2; for example, see [Introduction to OAuth 2[(https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2)] or [Understanding OAuth 2](http://www.bubblecode.net/en/2016/01/22/understanding-oauth2/). 

To get a good understanding of ASP.NET Core Security, review the [documentation](https://docs.microsoft.com/en-us/aspnet/core/) provided by Microsoft.

Additionally, you should have a good understanding of how the .NET [Configuration service](http://docs.asp.net/en/latest/fundamentals/configuration.html) works and a basic understanding of the `ConfigurationBuilder` and how to add providers to the builder.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.asp.net/en/latest/fundamentals/startup.html) class is used in configuring the application services and the middleware used in the app. Specifically pay particular attention to the usage of the `Configure()` and `ConfigureService())` methods. 

With regard to Cloud Foundry, you should have a good understanding of Cloud Foundry OAuth2 security services (e.g. [UAA Server](https://github.com/cloudfoundry/uaa) and/or [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)).

In order to use the Security provider you need to do the following:

* Create and bind an instance of a Cloud Foundry OAuth2 service to your application.
* Configure any additional settings the Security provider will need. (Optional)
* Add the Cloud Foundry configuration provider to the ConfigurationBuilder.    
* Add and Use the security provider in the application.
* Secure your endpoints 


##### 1.2.1 Add NuGet Reference
To make use of the provider, you need to add a reference to the Steeltoe Cloud Foundry Security NuGet. 

The provider can be found in the `Steeltoe.Security.Authentication.CloudFoundry` package.

Add the provider to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Security.Authentication.CloudFoundry" Version= "1.1.0"/>
...
</ItemGroup>
```
##### 1.2.2 Configure Settings

Typically you do not need to configure any additional settings for the provider.  

But, sometimes it might be necessary when running on Cloud Foundry and you are using self-signed certificates.  In that case, you might need to disable certificate validation.

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

##### 1.2.3 Cloud Foundry

As mentioned earlier there are a couple OAuth2 services (e.g. UAA Server or Pivotal SSO) you can use on Cloud Foundry. Rather than explaining the steps here to create and bind OAuth2 service to your app, we recommend you read the documentation provided be each of the service providers.

Regardless of which provider you choose, once you have bound the OAuth service to your application, the OAuth service settings will have been setup in `VCAP_SERVICES` and will be available to the provider.

In order for these settings to be picked up and put in the configuration, you have to make use of the Steeltoe Cloud Foundry configuration provider. 

To do that, you simply need to add a `AddCloudFoundry()` method call to the `ConfigurationBuilder`. Here is an example:

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
>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 1.2.4 Add Cloud Foundry Authentication

Now in order to use the provider in your application, you need to add it to the service container.  

You do this in the `ConfigureServices()` method of the `Startup` class. Here is some example code illustrating this:

```
using Steeltoe.Security.Authentication.CloudFoundry;
using Steeltoe.Extensions.Configuration;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Cloud Foundry authentication service
        services.AddCloudFoundryAuthentication(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ....
```
The `AddCloudFoundryAuthentication(Configuration)` method call configures and adds the Cloud Foundry OAuth2 authentication service to the service container.  Once in place it can then be referenced and used as middleware during request processing.

##### 1.2.5 Configure Cloud Foundry Authentication
Once you have configured and added the provider to the service container, then the last thing to do is configure the request processing pipeline to use it. 

Below is an example illustrating how to do this:

```
using Steeltoe.Security.Authentication.CloudFoundry;
using Steeltoe.Extensions.Configuration;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }

    public void Configure(IApplicationBuilder app, ....)
    {
        ....
        app.UseStaticFiles();

        // Add Cloud Foundry middleware to pipeline
        app.UseCloudFoundryAuthentication(new CloudFoundryOptions()
        {
                AccessDeniedPath = new PathString("/Home/AccessDenied")
        });

        app.UseMvc();

  
    }
    ....
```

The `UseCloudFoundryAuthentication()` call adds the Cloud Foundry security middleware to the pipeline and configures the access denied action to be used.

##### 1.2.6 Securing Endpoints

Once you have the work done in your `Startup` class, then you can start to secure endpoints using the standard ASP.NET Core `Authorize` attribute. 

See the Microsoft documentation on  [ASP.NET Core Security](https://docs.asp.net/en/latest/security/) for a better understanding of how to use these attributes.  

Here is an example controller using these security attributes:

```
using Microsoft.AspNetCore.Authentication;
....
public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    [Authorize]
    public IActionResult About()
    {
        ViewData["Message"] = "Your About page.";
        return View();
    }

    [Authorize(Policy = "testgroup1")]
    public IActionResult Contact()
    {
        ViewData["Message"] = "Your contact page.";

        return View();
    }
...
}
```

The above example code establishes the following security processing to occur: 

* If a user attempts to access the `About` action and the user is not authenticated, then the user will be redirected to the OAuth2 server (e.g. UAA Server) to login and become authenticated.  
* If a user is authenticated but does not meet the restrictions established by the policy `testgroup` then the user will be denied access to the `Contact` action.

### 2.0 Resource Protection using JWT

This provider, when used in an ASP.NET Core application, enables you to secure access to REST resources and endpoints using JWT tokens issued by Cloud Foundry Security services.

This enables you to leverage existing credentials configured in a UAA Server or a Pivotal Single Signon service for authentication and authorization.

In addition to the Quick Start below, there are other Steeltoe sample applications that you can use to help you understand how to make use of this connector:
 
* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ) - a polyglot (i.e. Java and .NET) micro-services based sample app illustrating inter-operability between Java and .NET based micro-services running on Cloud Foundry, secured with OAuth2 Security Services and using Spring Cloud Services.

#### 2.1 Quick Start

This quick start makes use of a ASP.NET Core sample application to illustrate how you can secure your web api endpoints using JWT Bearer tokens issued by the Cloud Foundry UAA server. 

Note: This application is intended to be used in conjunction with the quick start application above, `CloudFoundrySingleSignon`. You should FIRST get that quick start up and running on Cloud Foundry and then follow these instructions after that.

##### 2.1.1 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Security/src/CloudFoundryJwtAuthentication
```

##### 2.1.2 Run OAuth SSO Quick Start

As mentioned above, this application is intended to be used in conjunction with the quick start application `CloudFoundrySingleSignon`. Make sure you have completed that quick start before proceeding.

##### 2.1.3 Publish Sample 
Use the `dotnet` tool to build and publish the application to the folder `publish`.

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
Use the Cloud Foundry CLI to target and push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> cf target -o myorg -s development
>
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note: The provided manifests will create an app named `jwtauth` and attempt to bind it to the CUPS service `myOAuthService`. 

The CUPS service is references is created when you follow the instructions for `CloudFoundrySingleSignon` quick start.

##### 2.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs jwtauth`)

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

Once the application is up and running, use the quick start application above, `CloudFoundrySingleSignon`, to access it.

##### 2.1.7 Understand Sample

The `CloudFoundryJwtAuthentication` sample was created using the .NET Core tooling `webapi` template ( i.e. `dotnet new webapi` ) . 

To gain an understanding of the Steeltoe related changes to generated template code,  examine the following files:

 * `CloudFoundryJwtAuthentication.csproj` - Contains `PackageReference` for Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundry` and also one for `Steeltoe.Security.Authentication.CloudFoundry`
 * `Program.cs` - Code added to read the `--server.urls` command line
 * `Startup.cs` - Code added to the `ConfigureServices()` method to add a `CloudFoundryJwtAuthentication` to the service container. Code was also added to define two authorization policies; one requiring a `testgroup` claim, and the other requiring a `testgroup1` claim.  Additionally, in the `Configure()` method, the Steeltoe `CloudFoundryJwtAuthentication` middleware was added to the request processing pipeline.
 * `ValuesController.cs` - One code change was made to the controller; `[Authorize(Policy = "testgroup")]` was added to the `Get()` action.

#### 2.2 Usage

This package makes use of Java Web Tokens (JWT) and builds on JWT Security services provided by ASP.NET Core Security. You should take some time to understand both, before proceeding to use this provider.

Many resources are available for understanding JWT; for example, see [JWT IO](https://jwt.io/) or [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token). 

To get a good understanding of ASP.NET Core Security, review the [documentation](https://docs.microsoft.com/en-us/aspnet/core/) provided by Microsoft.

Additionally, you should have a good understanding of how the .NET [Configuration services](http://docs.asp.net/en/latest/fundamentals/configuration.html) works and a basic understanding of the `ConfigurationBuilder` and how to add providers to the builder.  

You should also have a good understanding of how the ASP.NET Core [Startup](https://docs.asp.net/en/latest/fundamentals/startup.html) class is used in configuring the application services and the middleware used by the app. Specifically pay particular attention to the usage of the `Configure()` and `ConfigureServices()` methods. 

With regard to Cloud Foundry, you should have a good understanding of Cloud Foundry OAuth2 security services (e.g. [UAA Server](https://github.com/cloudfoundry/uaa) and/or [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)) along with an understanding how they use and issue JWTs.

In order to use the Security provider you need to do the following:

```
* Create and bind an instance of a Cloud Foundry OAuth2 service to your application.
* Configure any additional settings the Security provider will need. (Optional)
* Add the Cloud Foundry configuration provider to the ConfigurationBuilder.    
* Add and Use the security provider in the application.
* Secure your endpoints
``` 

##### 2.2.1 Add NuGet Reference

To make use of the provider, you need to add a reference to the Steeltoe Cloud Foundry Security NuGet.  

The provider can be found in the `Steeltoe.Security.Authentication.CloudFoundry` package.

Add the provider to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Security.Authentication.CloudFoundry" Version= "1.1.0"/>
...
</ItemGroup>
```
##### 2.2.2 Configure Settings

Typically you do not need to configure any additional settings for the provider.  

But, sometimes it might be necessary when running on Cloud Foundry and you are using self-signed certificates.  In that case, you might need to disable certificate validation.

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
##### 2.2.3 Cloud Foundry

As mentioned earlier there are a couple OAuth2 services (e.g. UAA Server or Pivotal SSO) you can use on Cloud Foundry. Rather than explaining the steps here on how to create and bind OAuth2 services to your app, we recommend you read the documentation provided be each of the service providers.

Regardless of which provider you choose, once you have bound the OAuth service to your application, the OAuth service settings will have been setup in `VCAP_SERVICES` and will be available to the provider.

In order for these settings to be picked up and put in the configuration, you have to make use of the Steeltoe Cloud Foundry configuration provider. 

To do that, you simply need to add a `AddCloudFoundry()` method call to the `ConfigurationBuilder`. Here is an example:

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
>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 2.2.4 Add Cloud Foundry JwtAuthentication

Now in order to use the provider in your application, you need to add it to your service collection. 

You do this in the `ConfigureServices()` method of the `Startup` class as shown below:

```
using Steeltoe.Security.Authentication.CloudFoundry;
using Steeltoe.Extensions.Configuration;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Cloud Foundry authentication service
        services.AddCloudFoundryJwtAuthentication(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ....
```

The `AddCloudFoundryJwtAuthentication(Configuration)` method call configures and adds the Cloud Foundry JWT authentication service to the service container. Once in place it can then be referenced and used as middleware during request processing.


##### 2.2.5 Configure Cloud Foundry JwtAuthentication

Once you have configured and added the provider to the service container, then the last thing to do is configure the request processing pipeline to use it. 

Below is an example illustrating how to do this:

```
using Steeltoe.Security.Authentication.CloudFoundry;
using Steeltoe.Extensions.Configuration;

public class Startup {
    .....
    public IConfigurationRoot Configuration { get; private set; }
    public Startup(...)
    {
      .....
    }

    public void Configure(IApplicationBuilder app, ....)
    {
        ....
        app.UseStaticFiles();

        // Add Cloud Foundry middleware to pipeline
        app.UseCloudFoundryJwtAuthentication();

        app.UseMvc();

  
    }
    ....
```
The `UseCloudFoundryJwtAuthentication()` method call adds the Cloud Foundry middleware to the pipeline.

##### 2.2.6 Securing Endpoints

Once you have the work done in your `Startup` class you can then you can start to secure endpoints using the standard ASP.NET Core `Authorize` attribute. 

See the Microsoft documentation on  [ASP.NET Core Security](https://docs.asp.net/en/latest/security/) for a better understanding of how to use these attributes. 

 Here is an example, used in a `webapi` controller illustrating how to use the security attributes:

```
using Microsoft.AspNetCore.Authentication;
....

[Route("api/[controller]")]
public class ValuesController : Controller
{
    // GET api/values
    [HttpGet]
    [Authorize(Policy = "testgroup")]
    public IEnumerable<string> Get()
    {
        return new string[] { "value1", "value2" };
    }

...
}
``` 

In the example above, if an incoming REST request is made to the `api/values` endpoint, and the request does not contain a valid JWT bearer token with a `scope` claim equal to `testgroup` the request will be rejected.

### 3.0 Redis Key Storage Provider

This provider simplifies using Redis on Cloud Foundry as a custom key ring repository for ASP.NET Core Data Protection.

#### 3.1 Quick Start
This quick start makes use of a ASP.NET Core sample application to illustrate how to use a Redis cache on Cloud Foundry for storing Data Protection keys.

##### 3.1.1 Get Sample

```
> git clone https://github.com/SteeltoeOSS/Samples.git
> cd Samples/Security/src/RedisDataProtectionKeyStore
```

##### 3.1.2 Create Service

You must first create an instance of the Redis service in a org/space.

```
> cf target -o myorg -s development
> cf create-service p-redis shared-vm myRedisService
```

##### 3.1.3 Publish Sample 
Use the `dotnet` tool to build and publish the application to the folder `publish`. 

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
Use the Cloud Foundry CLI to target and push the published application to Cloud Foundry. 

Note below we show how to push for both Linux and Windows. Just pick one in order to proceed.

```
> cf target -o myorg -s development
>
> # Push to Linux
> cf push -f manifest.yml -p publish
>    
>  # Push to Windows
> cf push -f manifest-windows.yml -p publish   
```

Note: The provided manifest will create an app named `keystore` and attempt to bind to the Redis service `myRedisService`.

##### 3.1.5 Observe Logs

To see the logs as you startup the application use the `cf` CLI to tail the apps logs. (i.e. `cf logs keystore`)

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

At this point the app is up and running. Bring up the home page of the app and click on the `Protected` link in the menu and you should see something like the following:

```
Protected Data.
InstanceIndex=0
SessionId=989f8693-b43b-d8f0-f48f-187460f2aa02
ProtectedData=My Protected String - 6f954faa-e06d-41b9-b88c-6e387a921420
```

At this point the app has created a new Session with the ProtectedData encrypted and saved in the Session.

Next, scale the app to multi-instance (eg. `cf scale keystore -i 2`) and wait for the new instance to startup.

Using the same browser session, click on the `Protected` menu item a couple more times. It may take a couple clicks to get routed to the second app instance. 

When this happens, you should see the InstanceId changing but the SessionId and the ProtectedData remaining the same.

A couple things to note at this point about this app:

* The app is using the Cloud Foundry Redis service to store session data.  As a result, the session data is available to all instances of the app.
* The `session handle` that is in the session cookie and the data that is stored in the session in Redis is encrypted using keys that are now stored in the key ring which is also stored in the 
Cloud Foundry Redis service. So when you scale the app to multiple instances the same keyring is used by all instances and therefore the `session handle` and the session data can be decrypted by any instance of the application.

##### 1.1.11 Understand Sample

The `RedisDataProtectionKeyStore` sample was created using the .NET Core tooling `mvc` template ( i.e. `dotnet new mvc` ) . 

To gain an understanding of the Steeltoe related changes to generated template code,  examine the following files:

 * `RedisDataProtectionKeyStore.csproj` - Contains `PackageReference`s for Steeltoe NuGets `Steeltoe.Security.DataProtection.Redis`, `Steeltoe.CloudFoundry.Connector.Redis`, and `Steeltoe.Extensions.Configuration.CloudFoundry`.
 * `Program.cs` - Code added to read the `--server.urls` command line.
 * `Startup.cs` - Several changes made:
   * Code added to the `ConfigurationBuilder` to add the Steeltoe Cloud Foundry configuration provider.
   * Modified the `ConfigureServices()` method adding `RedisConnectionMultiplexer` to the service container by using Steeltoe Redis connector.
   * Configured `DataProtection` to `PersistKeysToRedis` using the Steeltoe Redis Key Storage Provider.
   * Added a `IDistributedCache` to the service container, configured by Steeltoe Redis connector.  This causes the ASP.NET Core Session service to use this cache for storage.
 * `HomeController.cs` - Added `Protected` action to encrypt some data using the Data Protection service and to add the data to the Session. 
 * `Protected.cshtml` - The view used to display the data returned from the Session.
 
#### 3.2 Usage

In order to use this provider you need to do the following:

 * Create and bind a Redis Service instance to your application.
 * Add Steeltoe Cloud Foundry config provider to your ConfigurationBuilder.
 * Add Redis ConnectionMultiplexer to your ServiceCollection.
 * Add DataProtection to your ServiceCollection & configure it to PersistKeysToRedis

##### 3.2.1 Add NuGet Reference
To make use of the provider, you need to add a reference to the Steeltoe DataProtection Redis NuGet.  

The provider can be found in the `Steeltoe.Security.DataProtection.Redis` package.

Add the provider to your project using the following `PackageReference` in your project file.

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.Security.DataProtection.Redis" Version= "1.1.0"/>
...
</ItemGroup>
```

You will also need to add a reference to the Steeltoe Redis connector.

The connector can be found in the `Steeltoe.CloudFoundry.Connector.Redis` package.

Add the connector to your project using the following `PackageReference`:

```
<ItemGroup>
....
    <PackageReference Include="Steeltoe.CloudFoundry.Connector.Redis" Version= "1.1.0"/>
...
</ItemGroup>
```

##### 3.2.2 Cloud Foundry

To use Redis Data Protection key ring provider on Cloud Foundry you have to install a Redis service and create and bind a instance of it to your application using the Cloud Foundry command line as follows:

```
> cf target -o myorg -s myspace
> # Create Redis service
> cf create-service p-redis shared-vm myRedisCache
> # Bind service to `myApp`
> cf bind-service myApp myRedisCache
> # Restage the app to pick up change
> cf restage myApp
```

Note: The commands above assume you are using the Redis service provided by Pivotal on Cloud Foundry. If you are using a different service then you will have to adjust the `create-service` command to fit your setup.

Once you have bound the service to the application, then information needed to connect to the cache has been setup in `VCAP_SERVICES`.
  
In order for the binding settings to be picked up and put in the configuration, you have to make use of the Cloud Foundry configuration provider. 

To do that, you simply need to add a `AddCloudFoundry()` method call to the `ConfigurationBuilder`. Here is an example:

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
>Note:  If you are using the Spring Cloud Config Server for centralized configuration management, you do not need to add the `AddCloudFoundry()` method call, as it is done automatically for you when using the Config server provider.

##### 3.2.3 Add Redis ConnectionMultiplexer

The next step is to add the StackExchange Redis `IConnectionMultiplexer` to your service container.  

You do this in the `ConfigureServices()` method of the `Startup` class by using the Steeltoe Redis Connector as follows:

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
        // Add StackExchange ConnectionMultiplexer configured from Cloud Foundry
        services.AddRedisConnectionMultiplexer(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ....
```

See the documentation on the Redis connector for more details on how you can configure additional settings to control its behavior.

##### 3.2.4 Add PersistKeysToRedis

Once you have added the `IConnectionMultiplexer` then the last step is to use the provider to configure DataProtection to persist the keys to Redis.  

Again, you do this in the `ConfigureServices()` method of the `Startup` class:

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
        // Add StackExchange ConnectionMultiplexer configured from Cloud Foundry
        services.AddRedisConnectionMultiplexer(Configuration);

        // Add DataProtection and persist keys to Cloud Foundry Redis service
        services.AddDataProtection()
            .PersistKeysToRedis()
            .SetApplicationName("Some Name");

        // Add framework services.
        services.AddMvc();
        ...
    }
    ....
```

##### 3.2.5 Use Redis Key Store
Once this has been setup, the keys used by the DataProtection framework will be stored in the bound Redis Cloud Foundry service.  There is nothing more that you need to do.
