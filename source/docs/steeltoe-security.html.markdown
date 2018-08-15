---
title: Security
order: 50
date: 2018/1/30
tags:
---

Steeltoe provides a number of Security related services that simplify using Cloud Foundry based OAuth2 security services in ASP.NET applications.

These providers enable using Cloud Foundry security providers (such as [UAA Server](https://github.com/cloudfoundry/uaa) and/or [Pivotal Single Sign-on](https://docs.pivotal.io/p-identity/)) for Authentication and Authorization credentials.

You can choose from several providers when adding Cloud Foundry security integration:

* [OAuth2 Single Sign-on with Cloud Foundry Security services](#1-0-oauth2-single-sign-on) (ASP.NET Core).
* [Using JWT tokens issued by Cloud Foundry for securing REST resources/endpoints](#2-0-resource-protection-using-jwt) (ASP.NET Core).
* `Steeltoe.Security.Authentication.CloudFoundryOwin` for ASP.NET 4.x applications using OWIN.
* `Steeltoe.Security.Authentication.CloudFoundryWcf` for ASP.NET 4.x applications using WCF.

In addition to Authentication and Authorization providers, Steeltoe Security offers:

* A security provider for [using Redis on Cloud Foundry with ASP.NET Core Data Protection Key Ring storage](#3-0-redis-key-storage-provider).
* A [CredHub API Client for .NET applications](#4-0-credhub-api-client) to perform credential storage, retrieval and generation.

# 0.0 Initialize Dev Environment

All of the Steeltoe sample applications are in the same repository. If you have not already done so, you can use git to clone the [Steeltoe Samples](https://github.com/SteeltoeOSS/Samples) repository or download with your browser from GitHub. The following git command clones the repository:

```bash
> git clone https://github.com/SteeltoeOSS/Samples.git
```

>NOTE: All Security samples in the Samples repository have a base path of `Samples/Security/src/`.

To make sure your Cloud Foundry CLI tools are logged in and targeting the correct org and space, use the following commands:

```bash
> cf login [-a API_URL] [-u USERNAME] [-p PASSWORD] [-o ORG] [-s SPACE] [--skip-ssl-validation]
or
> cf target -o <YourOrg> -s <YourSpace>
```

# 1.0 OAuth2 Single Sign-on

<span style="display:inline-block;margin:0 20px;">For use with </span><span style="display:inline-block;vertical-align:top;width:40%"> ![alt text](/images/CFF_Logo_rgb.png "Cloud Foundry")</span>

This provider enables log-in functionality with OAuth 2.0 and credentials provided from Cloud Foundry security services in ASP.NET Core applications.

Single Sign-on enables you to leverage existing credentials configured in a UAA Server or a Pivotal Single Sign-on service for authentication and authorization.

In addition to the Quick Start, you can use other Steeltoe sample applications to help you understand how to use this provider, including:

* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ): A polyglot microservices-based sample application showing interoperability between Java and .NET on Cloud Foundry, secured with OAuth2 Security Services, and using Spring Cloud Services.

The source code for this provider can be found [here](https://github.com/SteeltoeOSS/Security).

## 1.1 Quick Start

This quick start uses an ASP.NET Core sample application to show how to use the Steeltoe Cloud Foundry Single Sign-on provider for Authentication and Authorization against a Cloud Foundry UAA Server.

### 1.1.1 Locate Sample

To get started, change directory to the Cloud Foundry Single Sign-on sample, as follows:

```bash
> cd Samples/Security/src/CloudFoundrySingleSignon
```

### 1.1.2 Get UAA CLI

Before creating the OAuth2 service instance, you can use the UAA command line tool to establish some security credentials for your sample application.

To install the UAA command line tool and target your UAA server, you first need to [install Ruby on your system](https://www.ruby-lang.org/en/documentation/installation/). Once Ruby is installed, you can install the UAA CLI by using the following command:

```bash
> gem install cf-uaac
```

### 1.1.3 Get Admin Client Token

Next, using the UAA CLI, you can authenticate and obtain an access token for the `admin client` from the UAA server so that you can add the quick start application and user credentials.

To accomplish this, you need the `Admin Client Secret` for your installation of Cloud Foundry.

If you use Pivotal Cloud Foundry (PCF), you can obtain this secret from the `Ops Manager/Elastic Runtime` credentials page under the `UAA` section. Look for `Admin Client Credentials` and then use it in the following commands:

```bash
> # Target the UAA on Cloud Foundry
> uaac target uaa.`YOUR-CLOUDFOUNDRY-SYSTEM-DOMAIN` # (for example, `uaac target uaa.system.testcloud.com`)
>
> # Obtain an Admin Client Access Token
> uaac token client get admin -s `ADMIN_CLIENT_SECRET`
```

### 1.1.4 Add User and Group

Next, you need to add a new `user` and `group` to the UAA Server database.

Do *not* change the group name, `testgroup`, as that is used for policy based authorization in the quick start sample. You can change the username and password to anything you like. The following commands show how to add a test group, add a user, add the user to the test group:

```bash
> # Add group `testgroup`
> uaac group add testgroup
>
> # Add user `dave`
> uaac user add dave --given_name Dave --family_name Tillman --emails dave@testcloud.com --password Password1!
>
> # Add `dave` to `testgroup`
> uaac member add testgroup dave
```

### 1.1.5 Add Application Client

Next, add the quick start application as a new client for the UAA server to enable it to interact with the UAA server, as follows:

```bash
> uaac client add myTestApp --scope cloud_controller.read,cloud_controller_service_permissions.read,openid,testgroup \
        --authorized_grant_types authorization_code,refresh_token \
        --authorities uaa.resource \
        --redirect_uri http://single-signon.`YOUR-CLOUDFOUNDRY-APP-DOMAIN`/signin-cloudfoundry \
        --autoapprove cloud_controller.read,cloud_controller_service_permissions.read,openid,testgroup \
        --secret myTestApp
```

> Note: Replace `YOUR-CLOUDFOUNDRY-APP-DOMAIN` with your Cloud Foundry setup domain!

### 1.1.6 Create Service

Finally, create a user-provided service on Cloud Foundry to provide the appropriate UAA server configuration data to the application.

You may either use the provided `credentials.json` file when creating the service or provide the parameters inline. Either way, you must replace the `YOUR-CLOUDFOUNDRY-SYSTEM-DOMAIN` with your Cloud Foundry setup domain.

Once you have created a way to provide credentials, use the following commands:

```bash
> # Create CUPs service with JSON file:
> cf cups myOAuthService -p credentials.json
> # Create service with inline JSON:
> cf cups myOAuthService -p "{\"client_id\": \"myTestApp\",\"client_secret\": \"myTestApp\",\"uri\": \"uaa://login.<YOUR-CLOUDFOUNDRY-SYSTEM-DOMAIN>\"}"
```

>NOTE: The quote type and escaping for inline JSON varies based on which terminal you use, so you may have to adjust the preceding commands.

### 1.1.7 Publish and Push Sample

See [Publish Sample](#publish-sample) and the sections that follow for instructions on how to publish and push this sample to either Linux or Windows.

### 1.1.8 Observe Logs

You can use the `cf logs` command to see log output.

### 1.1.9 Logging in

At this point, the app is running. You can access it at <http://single-signon.`YOUR-CLOUDFOUNDRY-APP-DOMAIN`/>.

On the Apps menu, click on the "Log in" menu item. You should be redirected to the Cloud Foundry login page. Enter the user name and password that you created earlier (`dave` and `Password1!` in the example code). You should be authenticated and redirected back to the single-signon home page.

If you access the "About" menu item, you should see in the "About" page that user `dave` is a member of the group that is authorized to access the endpoint.

If you access the `Contact` menu item, you should see "Access Denied, Insufficient permissions" as `dave` is not a member of `testgroup1`, which is required to access the endpoint.

If you access the `InvokeJwtSample` menu item, the application tries to invoke a secured endpoint in a second Security sample app: `CloudFoundryJwtAuthentication`. For this menu item to be functional, you must complete the [JWT Security Quick Start](#2-0-resource-protection-using-jwt).

After completing the JWT quick start and `CloudFoundryJwtAuthentication` is running, accessing the `InvokeJwtSample` menu item while logged in should return some `values` from the app. If you are not logged in, you should see a `401 (Unauthorized)` message.

### 1.1.10 Understand Sample

The `CloudFoundrySingleSignon` sample was created by using the .NET Core tooling `mvc` template (`dotnet new mvc`) and then modified to add the Steeltoe libraries.

To gain an understanding of the Steeltoe related changes to generated template code, examine the following files:

* `CloudFoundrySingleSignon.csproj`: Contains the `PackageReference` for the Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundryCore` and one for the `Steeltoe.Security.Authentication.CloudFoundryCore`
* `Program.cs`: Added `.UseCloudFoundryHosting()` for dynamic port binding and `.AddCloudFoundry()` to read `VCAP_SERVICES` when pushed to Cloud Foundry.
* `Startup.cs`: Code added to the `ConfigureServices()` method to use `AddCloudFoundryOAuth` as an authentication service. Code was also added to define two authorization policies: one requiring `testgroup` claim and the other requiring `testgroup1` claim. Additionally, in the `Configure()` method, `.UseAuthentication()` was added to the ASP.NET Authentication middleware in the request processing pipeline.
* `HomeController.cs`: Several code changes were made to the controller:
  * `Login()` and `LogOff()` had action methods added.
  * `InvokeJwtSample()` was added to make REST call to `CloudFoundryJwtAuthentication`. Code was added here to grab the `access_token` from `HttpContext` and provide it in the request to `CloudFoundryJwtAuthentication`.
  * `[Authorize(Policy = "testgroup")]` was added to the `About()` action.
  * `[Authorize(Policy = "testgroup1")]` was added to the `Contact()` action.
  * `Views folder`: Various views added for displaying results from the actions.

## 1.2 Usage

This package is built on the OAuth 2 authentication flow and the services provided by ASP.NET Core Security. You should take some time to understand both before proceeding to use this provider.

Many resources are available for understanding OAuth 2. For example, see [Introduction to OAuth 2](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2) or [Understanding OAuth 2](http://www.bubblecode.net/en/2016/01/22/understanding-oauth2/).

To get a good understanding of ASP.NET Core Security, review the [documentation](https://docs.microsoft.com/en-us/aspnet/core/security) provided by Microsoft. If you are upgrading an application from ASP.NET Core 1.x, you may also want to review [Migrating Auth and Identity to ASP.NET Core 2.0](https://docs.microsoft.com/en-us/aspnet/core/migration/1x-to-2x/identity-2x).

Additionally, you should know how the .NET [Configuration service](http://docs.asp.net/en/latest/fundamentals/configuration.html) and the `ConfigurationBuilder` work and how to add providers to the builder.

You should also know how the ASP.NET Core [Startup](https://docs.asp.net/en/latest/fundamentals/startup.html) class is used in configuring the application services and how the middleware used in the application. Pay particular attention to the usage of the `Configure()` and `ConfigureService())` methods.

With regard to Cloud Foundry, you should know how Cloud Foundry OAuth2 security services (for example, [UAA Server](https://github.com/cloudfoundry/uaa) or [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)) work.

In order to use the Security provider:

1. Create an instance of a Cloud Foundry OAuth2 service and bind it to your application.
1. (Optional) Configure any additional settings the Security provider needs.
1. Add the Cloud Foundry configuration provider to the `ConfigurationBuilder`.
1. Add and use the security provider in the application.
1. Secure your endpoints.

### 1.2.1 Add NuGet Reference

To use the provider, add a reference to the Steeltoe Cloud Foundry Security NuGet.

The provider can be found in the `Steeltoe.Security.Authentication.CloudFoundryCore` package.

You can add the provider to your project by using the following `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.Security.Authentication.CloudFoundryCore" Version= "2.1.0"/>
...
</ItemGroup>
```

### 1.2.2 Configure Settings

Configuring additional settings for the provider is not typically required, but, when Cloud Foundry is using self-signed certificates you might need to disable certificate validation, as shown in the following example:

```json
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
        "validateCertificates": false
      }
    }
  }
  ...
}
```

The samples and most templates are already set up to read from `appsettings.json`. See [Reading Configuration Values](#reading-configuration-values).

### 1.2.3 Cloud Foundry

As mentioned earlier, there are two ways to use OAuth2 services on Cloud Foundry. We recommend you read the offical documentation ([UAA Server](https://github.com/cloudfoundry/uaa) and [Pivotal SSO](http://docs.pivotal.io/p-identity/1-5/getting-started.html)) or follow the instructions included in the samples for [UAA Server](https://github.com/SteeltoeOSS/Samples/blob/master/Security/src/CloudFoundrySingleSignon/README.md) and [Pivotal SSO](https://github.com/SteeltoeOSS/Samples/blob/master/Security/src/CloudFoundrySingleSignon/README-SSO.md) to quickly learn how to create and bind OAuth2 services.

Regardless of which provider you choose, once the service is bound to your application, the settings are available in `VCAP_SERVICES`. See [Reading Configuration Values](#reading-configuration-values).

### 1.2.4 Add Cloud Foundry OAuth

In order to configure the Cloud Foundry OAuth provider in your application, configure and add it to the service container in the `ConfigureServices()` method of the `Startup` class, as shown in the following example:

```csharp
using Steeltoe.Security.Authentication.CloudFoundry;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }
    public void ConfigureServices(IServiceCollection services)
    {
        ...
        services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = CloudFoundryDefaults.AuthenticationScheme;
            })
            .AddCookie((options) =>
            {
                // set values like login url, access denied path, etc here
                options.AccessDeniedPath = new PathString("/Home/AccessDenied");
            })
            .AddCloudFoundryOAuth(Configuration); // Add Cloud Foundry authentication service
        ...
    }
    public void Configure(IApplicationBuilder app, ...)
    {
        ...
        // Add authentication middleware to pipeline
        app.UseAuthentication();
    }
    ...
```

The `AddCloudFoundryOAuth(Configuration)` method call configures and adds the Cloud Foundry OAuth2 authentication service to the service container. Once in place, it can be used by the authentication middleware during request processing.

### 1.2.5 Securing Endpoints

Once the `Startup` class has been updated, you can secure endpoints with the standard ASP.NET Core `Authorize` attribute, as shown in the following example:

```csharp
using Microsoft.AspNetCore.Authentication;
...
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

The preceding example code establishes the following security rules:

* If a user attempts to access the `About` action and the user is not authenticated, then the user is redirected to the OAuth2 server (such as a UAA Server) to login.
* If an authenticated user attempts to access the `Contact` action but does not meet the restrictions established by the policy `testgroup1`, the user is denied access.

>TIP: See the Microsoft documentation on [ASP.NET Core Authorization](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/introduction).

# 2.0 Resource Protection using JWT

<span style="display:inline-block;margin:0 20px;">For use with </span><span style="display:inline-block;vertical-align:top;width:40%"> ![alt text](/images/CFF_Logo_rgb.png "Cloud Foundry")</span>

This provider lets you control access to REST resources by using JWT tokens issued by Cloud Foundry Security services (such as UAA or Pivotal Single Signon) in ASP.NET Core.

In addition to the [Quick Start](#2-1-quick-start), other Steeltoe sample applications can help you understand how to use this connector, including:

* [FreddysBBQ](https://github.com/SteeltoeOSS/Samples/tree/master/FreddysBBQ): A polyglot microservices-based sample showing interoperability between Java and .NET on Cloud Foundry, secured with OAuth2 Security Services, and using Spring Cloud Services.

## 2.1 Quick Start

This quick start uses an ASP.NET Core application with web API endpoints secured by JWT Bearer tokens issued by the Cloud Foundry UAA server.

>NOTE: This application is for use with the quick start application above, `CloudFoundrySingleSignon`. Complete that quick start and leave it running on Cloud Foundry before following these instructions.

### 2.1.1 Locate Sample

To get started, change directory to where the samples are stored, as follows:

```bash
> cd Samples/Security/src/CloudFoundryJwtAuthentication
```

### 2.1.2 Do OAuth SSO Quick Start

This application works in conjunction with the [`CloudFoundrySingleSignon`](#1-0-oauth2-single-sign-on) quick start application. Make sure you have completed that quick start before proceeding.

### 2.1.3  Publish and Push Sample

See [Publish Sample](#publish-sample) and the sections that follow for instructions on how to publish and push this sample to either Linux or Windows.

### 2.1.4 Observe Logs

You can use the `cf logs` command to see log output.

### 2.1.5 Access the Application

Once the application is running, use the [`CloudFoundrySingleSignon`](#1-0-oauth2-single-sign-on) quick start application to access it.

### 2.1.6 Understand the Sample

The `CloudFoundryJwtAuthentication` sample was created with the .NET Core tooling `webapi` template (`dotnet new webapi`) and then modified to add the Steeltoe libraries.

To understand the Steeltoe related changes to generated template code, examine the following files:

* `CloudFoundryJwtAuthentication.csproj`: Contains th `PackageReference` for the Steeltoe NuGet `Steeltoe.Extensions.Configuration.CloudFoundryCore` and also one for `Steeltoe.Security.Authentication.CloudFoundryCore`.
* `Program.cs`: Added `.UseCloudFoundryHosting()` for dynamic port binding and `.AddCloudFoundry()` to read `VCAP_SERVICES` when pushed to Cloud Foundry.
* `Startup.cs`: Code was added to the `ConfigureServices()` method to add a `CloudFoundryJwtAuthentication` to the service container. Code was also added to define two authorization policies: one requiring a `testgroup` claim and the other requiring a `testgroup1` claim. Additionally, in the `Configure()` method, `.UseAuthentication()` was added the ASP.NET Authentication middleware in the request processing pipeline.
* `ValuesController.cs`: `[Authorize(Policy = "testgroup")]` was added to the `Get()` action of the controller.

## 2.2 Usage

This package uses JSON Web Tokens (JWT) and builds on JWT Security services provided by ASP.NET Core Security. You should take some time to understand both before proceeding to use this provider.

Many resources are available for understanding JWT (for example, see [JWT IO](https://jwt.io/) or [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token)).

To get a good understanding of ASP.NET Core Security, review the [documentation](https://docs.microsoft.com/en-us/aspnet/core/) provided by Microsoft.

Additionally, you should know how the .NET [Configuration services](http://docs.asp.net/en/latest/fundamentals/configuration.html) the `ConfigurationBuilder` work and how to add providers to the builder.

You should also know how the ASP.NET Core [Startup](https://docs.asp.net/en/latest/fundamentals/startup.html) class is used in configuring the application services and how the middleware is used by the app. Pay particular attention to the usage of the `Configure()` and `ConfigureServices()` methods.

With regard to Cloud Foundry, you should have a good understanding of Cloud Foundry OAuth2 security services (such as [UAA Server](https://github.com/cloudfoundry/uaa) or [Pivotal Single Signon](https://docs.pivotal.io/p-identity/)) along with an understanding how they use and issue JWT.

To use the JWT Security provider:

1. Create and bind an instance of a Cloud Foundry OAuth2 service to your application.
1. (Optional) Configure any additional settings the Security provider will need.
1. Add the Cloud Foundry configuration provider to the ConfigurationBuilder.
1. Add and Use the security provider in the application.
1. Secure your endpoints

### 2.2.1 Add NuGet Reference

To use the provider, add a reference to the Steeltoe Cloud Foundry Security NuGet package, `Steeltoe.Security.Authentication.CloudFoundryCore`, with the NuGet package manager or directly to your project file by using the following `PackageReference`:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.Security.Authentication.CloudFoundryCore" Version= "2.1.0"/>
...
</ItemGroup>
```

### 2.2.2 Configure Settings

Configuring additional settings for the provider is not typically required, but, when Cloud Foundry uses self-signed certificates, you might need to disable certificate validation, as shown in the following example:

```json
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
  ...
}
```

The samples and most templates are already set up to read from `appsettings.json`. See [Reading Configuration Values](#reading-configuration-values).

### 2.2.3 Cloud Foundry

As mentioned earlier. you can use a couple of OAuth2 services (such as UAA Server or Pivotal SSO) on Cloud Foundry. Rather than explaining how to create and bind OAuth2 services to your app here, we recommend that you read the documentation provided by each of the service providers.

Regardless of which provider you choose, once the service is bound to your application, the settings are available in `VCAP_SERVICES`. See [Reading Configuration Values](#reading-configuration-values).

### 2.2.4 Add Cloud Foundry JwtAuthentication

To use the provider in your application, add it to your service collection in the `ConfigureServices()` method of the `Startup` class, as shown in the following example:

```csharp
using Steeltoe.Security.Authentication.CloudFoundryCore;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Cloud Foundry JWT Authentication service as the default
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddCloudFoundryJwtBearer(Configuration);
        // Add authorization policies
        services.AddAuthorization(options =>
        {
            options.AddPolicy("Orders", policy => policy.RequireClaim("scope", "order.me"));
            options.AddPolicy("AdminOrders", policy => policy.RequireClaim("scope", "order.admin"));
        });
        ...
    }
    public void Configure(IApplicationBuilder app, ...)
    {
        ...
        // Add the authentication middleware to the pipeline
        app.UseAuthentication();
    }
    ...
```

The `AddCloudFoundryJwtBearer(Configuration)` method call configures and adds the Cloud Foundry JWT authentication service to the service container. Once in place, the authentication middleware can use it during request processing.

### 2.2.6 Securing Endpoints

Once you have the work done in your `Startup` class, you can then you can start to secure endpoints by using the standard ASP.NET Core `Authorize` attribute.

See the Microsoft documentation on [ASP.NET Core Security](https://docs.asp.net/en/latest/security/) for a better understanding of how to use these attributes.

The following example shows a controller using the security attributes:

```csharp
using Microsoft.AspNetCore.Authentication;
...

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
}
```

In the preceding example, if an incoming REST request is made to the `api/values` endpoint and the request does not contain a valid JWT bearer token with a `scope` claim equal to `testgroup`, the request is rejected.

# 3.0 Redis Key Storage Provider

<span style="display:inline-block;margin:0 20px;">For use with </span><span style="display:inline-block;vertical-align:top;width:40%"> ![alt text](/images/CFF_Logo_rgb.png "Cloud Foundry")</span>

By default, ASP.NET Core stores the key ring on the local file system. Local file system usage in a Cloud Foundry environment is unworkable and violates the [twelve-factor guidelines](https://12factor.net/) for developing cloud native applications. By using the Steeltoe Redis Key Storage provider, you can reconfigure the Data Protection service to use Redis on Cloud Foundry for storage.

## 3.1 Quick Start

This quick start uses an ASP.NET Core application to show how to use a Redis cache on Cloud Foundry for storing Data Protection keys.

### 3.1.1 Locate Sample

To get started, change directory to where the samples are stored, as follows:

```bash
> cd Samples/Security/src/RedisDataProtectionKeyStore
```

### 3.1.2 Create Service

Create an instance of the Redis service in an org and space, as follows:

```bash
> # Create Redis service
> cf create-service p-redis shared-vm myRedisService
```

### 3.1.3 Publish and Push Sample

See [Publish Sample](#publish-sample) and the sections that follow for instructions on how to publish and push this sample to either Linux or Windows.

### 3.1.4 Observe Logs

You can use the `cf logs` command to see log output.

### 3.1.5 Access the Application

At this point, the application is running. Bring up the home page of the application and click on the `Protected` link in the menu. You should see content resembling the following:

```text
Protected Data.
InstanceIndex=0
SessionId=989f8693-b43b-d8f0-f48f-187460f2aa02
ProtectedData=My Protected String - 6f954faa-e06d-41b9-b88c-6e387a921420
```

At this point, the application has created a new Session with the `ProtectedData` encrypted and saved in the `Session`. The `SessionId` assigned to the session is shown along with the data that was created, encrypted, and put into the session.

Next, scale the app to multi-instance (for example, by using `cf scale keystore -i 2`) and wait for the new instances to startup.

Using the same browser session, click on the `Protected` menu item a couple more times. It may take a couple clicks to get routed to the second app instance.

When this happens, you should see the `InstanceId` change but the `SessionId` and the `ProtectedData` remain the same.

You should note the following about the application:

* The app uses the Cloud Foundry Redis service to store session data. As a result, the session data is available to all running instances of the application.
* The `session handle` that is stored in the Session Cookie sent down to the browser along with the data that is stored in the Session in Redis has been encrypted with keys that are now stored in the key ring, which is also stored in the Cloud Foundry Redis service.
* When you scale the app to multiple instances, the same key ring is used by all instances of the application. Therefore, the `session handle` and the Session data can be decrypted by any instance of the application.

### 3.1.6 Understand Sample

The `RedisDataProtectionKeyStore` sample was created by using the .NET Core tooling `mvc` template (`dotnet new mvc`) and then modified to add the Steeltoe libraries.

To understand the Steeltoe related changes to generated template code, examine the following files:

* `RedisDataProtectionKeyStore.csproj`: Contains the `PackageReference`s for the Steeltoe NuGet `Steeltoe.Security.DataProtection.Redis`, `Steeltoe.CloudFoundry.Connector.Redis`, and `Steeltoe.Extensions.Configuration.CloudFoundry`.
* `Program.cs`: Added `.UseCloudFoundryHosting()` for dynamic port binding and added `.AddCloudFoundry()` to read `VCAP_SERVICES` when pushed to Cloud Foundry
* `HomeController.cs`: Added `Protected` action to encrypt some data by using the Data Protection service and to add the data to the Session.
* `Protected.cshtml`: The view used to display the data returned from the Session.
* `Startup.cs`: Several changes were made:
  * Modified the `ConfigureServices()` method, adding `RedisConnectionMultiplexer` to the service container by using Steeltoe Redis connector.
  * Configured `DataProtection` to `PersistKeysToRedis` by using the Steeltoe Redis Key Storage Provider.
  * Added a `IDistributedCache` to the service container and configured by Steeltoe Redis connector. This causes the ASP.NET Core Session service to use this cache for storage.

## 3.2 Usage

To use this provider:

1. Create a Redis Service instance and bind it to your application.
1. Add the Steeltoe Cloud Foundry config provider to your `ConfigurationBuilder`.
1. Add the Redis `ConnectionMultiplexer` to your ServiceCollection.
1. Add `DataProtection` to your `ServiceCollection` and configure it to `PersistKeysToRedis`.

### 3.2.1 Add NuGet Reference

To use the provider, add a reference to the Steeltoe DataProtection Redis NuGet.

The provider can be found in the `Steeltoe.Security.DataProtection.RedisCore` package.

You can add the provider to your project by using the following `PackageReference` in your project file:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.Security.DataProtection.RedisCore" Version= "2.1.0"/>
...
</ItemGroup>
```

You also need the Steeltoe Redis connector. Add the `Steeltoe.CloudFoundry.ConnectorCore` package to get the Redis connector and helpers for setting it up.

You can use the NuGet Package Manager tools or directly add the following package reference to your .csproj file:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.CloudFoundry.ConnectorCore" Version= "2.1.0"/>
...
</ItemGroup>
```

### 3.2.2 Cloud Foundry

To use the Redis Data Protection key ring provider on Cloud Foundry, you have to install a Redis service and create and bind an instance of it to your application by using the Cloud Foundry command line, as shown in the following example:

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

>NOTE: The preceding commands are for the Redis service provided by Pivotal on Cloud Foundry. If you use a different service, you have to adjust the `create-service` command.

Once the service is bound to your application, the settings are available in `VCAP_SERVICES`. See [Reading Configuration Values](#reading-configuration-values).

### 3.2.3 Add Redis IConnectionMultiplexer

The next step is to add the StackExchange Redis `IConnectionMultiplexer` to your service container.

You can do so in the `ConfigureServices()` method of the `Startup` class by using the Steeltoe Redis Connector, as follows:

```csharp
using Steeltoe.CloudFoundry.Connector.Redis;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }
    public void ConfigureServices(IServiceCollection services)
    {
        // Add StackExchange ConnectionMultiplexer configured from Cloud Foundry
        services.AddRedisConnectionMultiplexer(Configuration);

        // Add framework services.
        services.AddMvc();
        ...
    }
    ...
```

See the documentation on the [Steeltoe Redis connector](../steeltoe-connectors/#5-2-2-configure-settings) for details on how you can configure additional settings to control its behavior.

### 3.2.4 Add PersistKeysToRedis

The last step is to use the provider to configure DataProtection to persist keys to Redis.

You can do so in the `ConfigureServices()` method of the `Startup` class, as shown in the following example:

```csharp
using Steeltoe.CloudFoundry.Connector.Redis;

public class Startup {
    ...
    public IConfiguration Configuration { get; private set; }
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
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
    ...
```

### 3.2.5 Use Redis Key Store

Once the Redis Key Store has been set up, the keys used by the `DataProtection` framework are stored in the bound Redis Cloud Foundry service. You need not do more.

# 4.0 CredHub API Client

[CredHub](https://github.com/cloudfoundry-incubator/credhub) manages credentials such as  passwords, certificates, certificate authorities, ssh keys, rsa keys, and other arbitrary values. Steeltoe provides the `CredHubBase` library for interacting with the [CredHub API](https://credhub-api.cfapps.io/) and provides the `CredHubCore` library for making that client library simpler to use in ASP.NET Core applications. Cloud Foundry is not required for the CredHub server or client but is used in this documentation as the hosting environment. You may wish to review the documentation for [CredHub on PCF](https://docs.pivotal.io/pivotalcf/2-0/credhub/). If you do not already have a UAA user to use for this test, you will need to use the UAA command line tool to establish some security credentials for the sample app. Choose one of the provided `credhub-setup` scripts in the folder `samples/Security/scripts` to target your Cloud Foundry environment and create a UAA client with permissions to read and write in CredHub.

>NOTE: If you choose to change the values for UAA_CLIENT_ID or UAA_CLIENT_SECRET, be sure to update the credentials in appsettings.json

>WARNING: As of this writing, CredHub is not approved for general use in all applications. We encourage you to check whether your use case is currently supported by CredHub before getting too involved.

## 4.1 Quick Start

This quick start uses an ASP.NET Core application to show how to use CredHub for storing, reading, updating, deleting, generating, regenerating, and interpolating credentials. This application assumes that a CredHub server is accessible at <https://credhub.service.cf.internal:8844>, which is the default address and port for a CredHub server running in Pivotal Cloud Foundry 2.0+. This address is not accessible from outside of Cloud Foundry and can be overridden with [CredHubClient settings](#4-2-2-configure-settings) as needed.

### 4.1.1 Locate Sample

To get started, change directory to where the samples are stored, as follows:

```bash
> cd Samples/Security/src/CredHubDemo
```

### 4.1.2 Publish and Push Sample

See [Publish Sample](#publish-sample) and the sections that follow for instructions on how to publish and push this sample to either Linux or Windows. Optionally use the `cf logs` command to see log output.

### 4.1.3 Observe Logs

You can use the `cf logs` command to see log output.

### 4.1.4 View Results

At this point the application is running. Bring up the home page of the application and you should see something resembling the following:

```text
Created credential:
Id: a00258a7-1c43-4f49-8c2a-c831b66ae027
Name: /writtenPassword
Type: Password
Value: 8c2c3c39-d0c1-40af-a7c5-7ca8b005ac92
Created: 2/2/18 5:34:32 PM
Delete operation results:
Generated credential was deleted successfully
```

This application uses all the functionality enabled by the Steeltoe CredHub Client, which is virtually all functionality available through the CredHub API. You can either use the navigation across the top of the web application to explore or keep reading to see what else is demonstrated by this application.

### 4.1.5 Understand the Sample

The `CredHubDemo` sample was created by using the Visual Studio ASP.NET Core MVC Web Application template, scaled back to remove some unneeded features, and then modified to add the Steeltoe libraries.

To understand the Steeltoe related changes to generated template code, examine the following files:

* `CredHubDemo.csproj`: Contains the `PackageReference`s for the Steeltoe NuGets `Steeltoe.Security.DataProtection.CredHubCore`, `Steeltoe.Management.CloudFoundryCore`, and `Steeltoe.Extensions.Configuration.CloudFoundryCore`.
* `Program.cs`: Several changes were made:
  * Manually set the `VCAP_SERVICES` environment variable with a CredHub reference, simulating a service broker operating with an unassisted flow of CredHub integration.
  * `.UseCloudFoundryHosting()` for dynamic port binding when running on Cloud Foundry.
  * `.AddCloudFoundry()` to read `VCAP_SERVICES` when pushed to Cloud Foundry.
  * `.UseCredHubInterpolation(new LoggerFactory().AddConsole())` to read the `VCAP_SERVICES` environment variable and (if CredHub tokens are found) use CredHub to interpolate credentials.
* `Startup.cs`: Several changes were made:
  * Modified the `ConfigureServices()` method as follows:
     * `AddCloudFoundryActuators` to include [Steeltoe Management](../steeltoe-management).
     * `Configure<CredHubOptions>(Configuration.GetSection("CredHubClient"))` to allow easier access to `CredHubClient` config later.
     * `AddCredHubClient(Configuration, logFactory)` to make the `CredHubClient` available through dependency injection.
  * Modified the `Configure()` method to `.UseCloudFoundryActuators()`.
* `HomeController.cs`:
  * The constructor uses dependency injection-provided `CredHubOptions` to create its own `CredHubClient`.
  * `Index` writes a new `Guid` as a `PasswordCredential` and then deletes it and returns the results in a view.
  * `Injected` has CredHub generate a new `PasswordCredential`and then deletes it and returns the results in a view.
  * `Interpolate` writes the `JsonCredential` expected by our manually created `VCAP_SERVICES` and then uses CredHub's Interpolate endpoint to replace the `credhub-ref` with the credentials.
  * `TestItAll` sets, gets, deletes, generates, and regenerates (if supported) all credential types but does not return detailed results in a view.

>NOTE: On initial startup, the `.UseCredHubInterpolation` call is expected to fail in the background as the CredHub credential has not been created yet.

## 4.2 Usage

To use the Steeltoe CredHub Client, you must:

* Have access to a CredHub Server (the client was built against version 1.6.5).
* Have UAA credentials for accessing the server with sufficient permissions for your use case
* Use the provided methods and constructors to create, inject, or utilize the client.

### 4.2.1 Add NuGet Reference

To use this library with ASP.NET Core, add a NuGet reference to `Steeltoe.Security.DataProtection.CredHubCore`. For other application types, use `Steeltoe.Security.DataProtection.CredHubBase`. Most of the functionality resides in `CredHubBase`. The purpose of `CredHubCore` is to provide additional methods for a simpler experience when using ASP.NET Core.

Use the NuGet package manager tools or directly add the appropriate package to your project using the a `PackageReference`, as follows:

```xml
<ItemGroup>
...
    <PackageReference Include="Steeltoe.Security.DataProtection.CredHubCore" Version= "2.1.0-rc1"/>
...
</ItemGroup>
```

### 4.2.2 Configure Settings

Settings for this library are expected to have a prefix of `CredHubClient`. The following example shows what that looks like in JSON:

```json
{
  ...
  "credHubClient": {
    "validateCertificates": "false"
  }
  ...
}
```

The `CredHubClient` supports four settings:

|Setting Name|Description|Default|
|---|---|---|
|CredHubUrl|The address of the CredHub API|<https://credhub.service.cf.internal:8844/api>|
|CredHubUser|The username for UAA auth|`null`|
|CredHubPassword|The password for UAA auth|`null`|
|ValidateCertificates|Whether to validate certificates for UAA and/or CredHub servers|`true`|

The samples and most templates are already set up to read from `appsettings.json`. See [Reading Configuration Values](#reading-configuration-values).

### 4.2.3 On Cloud Foundry

Pivotal Cloud Foundry (in versions 2.0 and up) ships with a version of CredHub Server with which this client works. To use UAA authentication, you will need a user with `credhub.read` and/or `credhub.write` claims.

### 4.2.4 Getting a Client

There are several ways to create a `CredHubClient`, depending on whether you want to use Microsoft's dependency injection. Regardless of the creation method selected, once the client has been created, all functionality is the same.

#### 4.2.4.1 Create and Inject Client

If you use Microsoft's Dependency injection framework, you can use `IServiceCollection.AddCredHubClient()` to create, configure, and inject `CredHubClient`, as shown in the folloowing example:

```csharp
using Steeltoe.Security.DataProtection.CredHubCore;
...
public class Startup
{
    ILoggerFactory logFactory;
    public Startup(IConfiguration configuration, ILoggerFactory logFactory)
    {
        Configuration = configuration;
        this.logFactory = logFactory;
    }
    public IConfiguration Configuration { get; }
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddMvc();
        services.AddCredHubClient(Configuration, logFactory);
    }
    ...
}
...
```

#### 4.2.4.2 Create UAA Client

You can use `CredHubClient.CreateUAAClientAsync()` to directly create a CredHub client that authenticates with a username and password that is valid on the UAA server CredHub is configured to trust. This client calls `/info` on the CredHub server to discover the UAA server's address and appends `/oauth/token` when requesting a token. The following listing shows how to do it:

```csharp
var credHubClient = await CredHubClient.CreateUAAClientAsync(new CredHubOptions());
```

>NOTE: If you need to override the UAA server address, use the `UAA_Server_Override` environment variable, making sure to include the path to the token endpoint.

#### 4.2.4.3 Interpolation-Only

If you wish to use CredHub to interpolate entries in `VCAP_SERVICES`, you can use `WebHostBuilder.UseCredHubInterpolation()`. This method looks for `credhub-ref` in `VCAP_SERVICES` and uses a `CredHubClient` to replace the credential references with credentials stored in CredHub but does not return the `CredHubClient`. The following example shows how to do it:

```csharp
    var host = new WebHostBuilder()
        .UseKestrel()
        .UseCloudFoundryHosting()
        .UseContentRoot(Directory.GetCurrentDirectory())
        .UseIISIntegration()
        .UseStartup<Startup>()
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
            loggingBuilder.AddDynamicConsole();
        })
        .UseCredHubInterpolation(new LoggerFactory().AddConsole())
        .Build();
```

### 4.2.4 Credential Types

These are the .NET representations of credentials that can be stored in CredHub. Refer to the [CredHub documentation](https://credhub-api.cfapps.io/) for more detail.

#### 4.2.4.1 ValueCredential

Any string can be used for a `ValueCredential`. CredHub allows Get, Set, Delete, and Find operations with `ValueCredential`

#### 4.2.4.2 PasswordCredential

Any string can be used for a `PasswordCredential`. CredHub allows Get, Set, Delete, Find, Generate, and Regenerate operations with `PasswordCredential`

#### 4.2.4.3 UserCredential

A `UserCredential` has `string` properties for `Username` and `Password`. CredHub allows Get, Set, Delete, Find, Generate, and Regenerate operations with `UserCredential`. Regenerate operations do not regenerate the username.

#### 4.2.4.4 JsonCredential

Any JSON object can be used for a `JsonCredential`. CredHub allows Get, Set, Delete, and Find operations with `JsonCredential`.

#### 4.2.4.5 CertificateCredential

A `CertificateCredential` represents a security certificate. CredHub allows Get, Set, Delete, Find, Generate, Regenerate, and Bulk Regenerate operations with `CertificateCredential`. The following table describes specific properties:

|Property|Description|
|---|---|
|CertificateAuthority|The certificate of the Certificate Authority|
|CertificateAuthorityName|The name of the CA credential in credhub that has signed this certificate|
|Certificate|The string representation of the certificate|
|PrivateKey|The private key for the certificate|

#### 4.2.4.6 RsaCredential

The `RsaCredential` has string properties for `PublicKey` and `PrivateKey`. CredHub allows Get, Set, Delete, Find, Generate, and Regenerate operations with `RsaCredential`.

#### 4.2.4.7 SshCredential

The `SshCredential` has string properties for `PublicKey`, `PrivateKey`, and `PublicKeyFingerprint`. CredHub allows Get, Set, Delete, Find, Generate, and Regenerate operations with `SshCredential`.

### 4.2.5 CredHub Read Operations

All `CredHubClient` Read operations operate asynchronously and do not change the credentials or permissions stored in CredHub. Refer to the [CredHub documentation](https://credhub-api.cfapps.io/) for more detail. For brevity, the samples shown later in this guide use `_credHubClient` to reference an instance of `CredHubClient` that has been created previously. See [Getting a Client](#4-2-4-getting-a-client) for instructions on how to create a `CredHubClient`.

#### 4.2.5.1 Get by ID

You can use `await _credHubClient.GetByIdAsync<CredentialType>(credentialId)` to retrieve a credential by its `Guid`. Only the current credential value is returned.

#### 4.2.5.2 Get by Name

You can use `await _credHubClient.GetByNameAsync<CredentialType>(credentialName)` to retrieve a credential by its `Name`. Only the current credential value is returned.

#### 4.2.5.3 Get by Name with History

You can use `await _credHubClient.GetByNameWithHistoryAsync<CredentialType>(credentialName, numEntries)` to retrieve a credential by name with the most recent `numEntries` holding the number of entries.

#### 4.2.5.4 Find by Name

You can use `await _credHubClient.FindByNameAsync(credentialName)` to retrieve a list of `FoundCredential` objects that are either a full or partial match for the name searched. The `FoundCredential` type includes only the `Name` and `VersionCreatedAt` properties, so follow-up requests are expected to retrieve credential details.

#### 4.2.5.5 Find by Path

You can use `await _credHubClient.FindByPathAsync(path)` to retrieve a list of `FoundCredential` objects that are either a full or partial match for the name searched. The `FoundCredential` type includes only the `Name` and `VersionCreatedAt` properties, so follow-up requests are expected to retrieve credential details. Use the `/` path value to return all accessible credentials.

#### 4.2.5.6 Find All Paths

You can use `await _credHub.FindAllPathsAsync()` to retrieve a list of all known credential paths.

#### 4.2.5.7 Interpolate

One of the more powerful features of CredHub is the `Interpolate` endpoint. With one request, you may retrieve N number of credentials that have been stored in CredHub. To use it from .NET, call `await _credHub.InterpolateServiceDataAsync(serviceData)`, where `serviceData` is the string representation of `VCAP_SERVICES`. `CredHubClient` returns the interpolated `VCAP_SERVICES` data as a string. If you wish to have the interpolated data applied to your application configuration, see [the .UseCredHubInterpolation() documentation](#4-2-4-4-interpolation-only)

The following example shows a typical request object for the `Interpolate` endpoint:

```json
{
  "p-demo-resource": [
    {
      "credentials": {
        "credhub-ref": "((/config-server/credentials))"
      },
      "label": "p-config-server",
      "name": "config-server",
      "plan": "standard",
      "provider": null,
      "syslog_drain_url": null,
      "tags": [
        "configuration",
        "spring-cloud"
      ],
      "volume_mounts": []
    }
  ]
}
```

The following example shows a typical response object from the `Interpolate` endpoint:

```json
{
  "p-demo-resource": [
    {
      "credentials": {
        "key": 123,
        "key_list": [
          "val1",
          "val2"
        ],
        "is_true": true
      },
      "label": "p-config-server",
      "name": "config-server",
      "plan": "standard",
      "provider": null,
      "syslog_drain_url": null,
      "tags": [
        "configuration",
        "spring-cloud"
      ],
      "volume_mounts": []
    }
  ]
}
```

>NOTE: At this time, only credential references at `credentials.credhub-ref` are interpolated. The `credhub-ref` key is removed and the referenced credential object is set as the value of the credentials.

### 4.2.6 CredHub Change Operations

All `CredHubClient` Change operations operate asynchronously and affect stored credentials. Refer to the [CredHub documentation](https://credhub-api.cfapps.io/) for more detail. For brevity, the samples shown later in this guide use `_credHubClient` to reference an instance of `CredHubClient` that has been created previously. See [Getting a Client](#4-2-4-getting-a-client) for instructions on how to create a `CredHubClient`.

#### 4.2.6.1 Write

If you already have a credential that you want to store in CredHub, use a `Write` request. `CredHubClient.WriteAsync<T>()` expects a request object that descends from `CredentialSetRequest`. There is a `[Type]SetRequest` class for each credential type (`ValueSetRequest`, `PasswordSetRequest`, and so on). The SetRequest family of classes includes optional parameters for overwriting existing values and setting permissions, in addition to value properties for the credential. Include the type of credential you want to write to CredHub in the T parameter so the compiler knows the return type. The following example shows a typical `Write` request:

```csharp
var setValueRequest = new ValueSetRequest("sampleValueCredential", "someValue");
// set the value of credential "/sampleValueCredential" to "someValue" if there is NOT an existing value
var setValue1 = await _credHub.WriteAsync<ValueCredential>(setValueRequest);

// set the value of credential "/sampleValueCredential" to "someValue" even if there is an existing value
setValueRequest.Overwrite = true;
var setValue2 = await _credHub.WriteAsync<ValueCredential>(setValueRequest);
```

>NOTE: The default behavior on `Write` requests is to leave existing values alone. If you wish to overwrite a credential, be sure to pass either `OverwriteMode.converge` or `OverwriteMode.overwrite` for the `overwriteMode` parameter on your request object. See [Overwriting Credential Values](https://credhub-api.cfapps.io/#overwriting-credential-values).

Write requests allow the setting of permissions on a credential during generation, as shown in the following example:

```csharp
var desiredOperations = new List<OperationPermissions>
                        {
                            OperationPermissions.read,
                            OperationPermissions.write,
                            OperationPermissions.delete
                        };
var newPerms = new CredentialPermission { Actor = "uaa-user:credhub_client", Operations = desiredOperations };
var setRequest = new ValueSetRequest("sampleValueCredential", "someValue", new List<CredentialPermission> { newPerms });
var setValue = await _credHub.WriteAsync<ValueCredential>(setRequest);
```

#### 4.2.7.2 Generate

You can generate a new credential or overwrite an existing credential with a new generated value. CredHub is able to generate values for the following types: `CertificateCredential`, `PasswordCredential`, `RsaCredential`, `SshCredential`, and `UserCredential`. `CredHubClient.GenerateAsync<T>()` expects a request object that descends from `CredHubGenerateRequest`. There is a `[Type]GenerateRequest` class for each supported credential type (`CertificateGenerationRequest`, `PasswordGenerationRequest`, `RsaGenerationRequest`, and so on). Most of the `GenerateRequest` family of classes include a `[Type]GenerationParameters` parameter for specifying criteria for generating the credential. The following example shows how to generate a credential:

```csharp
var genParameters = new PasswordGenerationParameters { Length = 20 };
var genRequest = new PasswordGenerationRequest("generatedPassword", genParameters);
CredHubCredential<PasswordCredential> genPassword = await _credHub.GenerateAsync<PasswordCredential>(genRequest);
```

The following example demonstrates that `Generate` requests allow the setting of permissions on a credential during generation:

```csharp
var genParams = new PasswordGenerationParameters { Length = 20 };
var desiredOperations = new List<OperationPermissions>
                        {
                            OperationPermissions.read,
                            OperationPermissions.write,
                            OperationPermissions.delete
                        };
var newPerms = new CredentialPermission { Actor = "uaa-user:credhub_client", Operations = desiredOperations };
var genRequest = new PasswordGenerationRequest("generatedPW", genParams, new List<CredentialPermission> { newPerms });
CredHubCredential<PasswordCredential> genPassword = await _credHub.GenerateAsync<PasswordCredential>(genRequest);
```

>NOTE: The default behavior on `Generate` requests is to leave existing values alone. If you wish to overwrite a credential, be sure to pass either `OverwriteMode.converge` or `OverwriteMode.overwrite` for the `overwriteMode` parameter on your request object. See [Overwriting Credential Values](https://credhub-api.cfapps.io/#overwriting-credential-values).

#### 4.2.6.3 Regenerate

You can regenerate a credential in CredHub. CredHub can generate values for the following types: `CertificateCredential`, `PasswordCredential`, `RsaCredential`, `SshCredential`, and `UserCredential`.

>NOTE: Only credentials that were previously generated by CredHub can be regenerated.

The following example shows one way to regenerate a credential:

```csharp
var regeneratedCert = await _credHub.RegenerateAsync<CertificateCredential>("/MyGeneratedCert");
```

#### 4.2.6.4 Bulk Regenerate

You can regenerate all certificates that were previously generated by CredHub with a given certificate authority. The following example returns a list of `RegeneratedCertificates` which contains the credential names as a `List<string>` property named RegeneratedCredentials:

```csharp
RegeneratedCertificates bulkRegenerate = await _credHub.BulkRegenerateAsync("NameThatCA");
```

#### 4.2.6.5 Delete by Name

You can delete a credential by its full name. The following example returns a boolean indicating success or failure:

```csharp
bool deleteCertificate = await _credHub.DeleteByNameAsync("/MyPreviouslyGeneratedCertificate");
```

### 4.2.7 Permission Operations

CredHub supports permissions management on credential access for UAA users. See the [offical CredHub Permissions documentation](https://credhub-api.cfapps.io/#permissions).

#### 4.2.7.1 Get Permissions

You can get the permissions associated with a credential, as shown in the following example:

```csharp
List<CredentialPermission> response = await _credHub.GetPermissionsAsync("/example-password");
```

#### 4.2.7.2 Add Permissions

You can add permissions to an existing credential. The following example eturns the updated list of permissions for the specified credential:

```csharp
var desiredOps = new List<OperationPermissions> { OperationPermissions.read, OperationPermissions.write };
var newActorPermissions = new CredentialPermission { Actor = "uaa-user:credhub_client", Operations = desiredOps };
var newPerms = new List<CredentialPermission> { newActorPermissions };
List<CredentialPermission> response = await _credHub.AddPermissionsAsync("/example-password", newPerms);
```

#### 4.2.7.3 Delete Permissions

You can delete a permission associated with a credential. The following example returns a boolean indicating success or failure:

```csharp
bool response = await _credHub.DeletePermissionAsync("/example-password", "uaa-user:credhub_client");
```

# Common Steps

## Publish Sample

You can use the `dotnet` CLI to build and locally publish the application with your preferred framework and runtime. To get started, run the following command:

```bash
> dotnet restore --configfile nuget.config
```

Then you can use one of the following commands to publish:

* Linux with .NET Core: `dotnet publish -f netcoreapp2.1 -r ubuntu.14.04-x64`
* Windows with .NET Core: `dotnet publish -f netcoreapp2.1 -r win10-x64`
* Windows with .NET Platform: `dotnet publish -f net461 -r win10-x64`

## Push Sample

Use the Cloud Foundry CLI to push the published application to Cloud Foundry using the parameters that match what you selected for framework and runtime, as follows:

```bash
> # Push to Linux cell
> cf push -f manifest.yml -p bin/Debug/netcoreapp2.1/ubuntu.14.04-x64/publish
>
>  # Push to Windows cell, .NET Core
> cf push -f manifest-windows.yml -p bin/Debug/netcoreapp2.1/win10-x64/publish
>
>  # Push to Windows cell, .NET Framework
> cf push -f manifest-windows.yml -p bin/Debug/net461/win10-x64/publish
```

> Note: All sample manifests have been defined to bind their application to their service(s) as created above.

## Observe Logs

To see the logs as you startup the application, use `cf logs oauth`.

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

## Reading Configuration Values

Once the connector's settings have been defined, the next step is to read them so that they can be made available to the connector.

The code in the next example reads connector settings from the `appsettings.json` file with the .NET JSON configuration provider (`AddJsonFile("appsettings.json"))` and from `VCAP_SERVICES` with `AddCloudFoundry()`. Both sources are then added to the configuration builder. The following code shows how to read from both sources:

```csharp
public class Program {
    ...
    public static IWebHost BuildWebHost(string[] args)
    {
        return new WebHostBuilder()
            ...
            .UseCloudFoundryHosting()
            ...
            .ConfigureAppConfiguration((builderContext, configBuilder) =>
            {
                var env = builderContext.HostingEnvironment;
                configBuilder.SetBasePath(env.ContentRootPath)
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                    .AddEnvironmentVariables()
                    // Add to configuration the Cloudfoundry VCAP settings
                    .AddCloudFoundry();
            })
            .Build();
    }
    ...
```

When pushing the application to Cloud Foundry, the settings from service bindings merge with the settings from other configuration mechanisms (such as `appsettings.json`).

If there are merge conflicts, the last provider added to the Configuration takes precedence and overrides all others.

To manage application settings centrally instead of with individual files, use [Steeltoe Configuration](/docs/steeltoe-configuration) and a tool such as [Spring Cloud Config Server](https://github.com/spring-cloud/spring-cloud-config)

>NOTE: If you use the Spring Cloud Config Server, `AddConfigServer()` automatically calls `AddCloudFoundry()` for you.
