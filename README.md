# Steeltoe Main Site

It is built using [Middleman](https://middlemanapp.com/)

### Install Dependencies

Uses Gemfile to pull in necessary dependencies.

***Prerequisite*** Ruby must be installed

```bash
bundle install
```

### Local testing of Steeltoe site

This will spin up development server with a build of the local documentation.

```bash
middleman serve
```

Visit site locally at [http://localhost:4567](http://localhost:4567)

### Instructions for Updating Documentation

All documentation will be updated in the ```dev``` branch. Once the documentation looks correct in the [Steeltoe Staging](https://steeltoe-staging.cfapps.io/) site, merge the ```dev``` branch into the ```master``` branch and push the branches. 

### Branches and Builds

#### Development Build (dev)

Any commit to the ```dev``` branch is automatically built and added to the [Steeltoe Staging](https://steeltoe-staging.cfapps.io/) site.

#### Production Build (master)

***Important:*** Pushing the to the remote ```master``` branch will update the main [Steeltoe.io](https://steeltoe.io/) site.

Any commit to the ```master``` branch is automatically built and added to the [Steeltoe.io](https://steeltoe.io/) site.
