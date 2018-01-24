#!/bin/bash

# build-concourse-site.sh
# args: either 'stage' for staging config or 'prod' for production config

# Build the specified branch site and move artifacts to generate-site-content directory
cd steeltoe-site-${1} && bundle install && middleman build && cp -R ./build/* ../generated-site-content

# Build the 1.x branch site and move artifacts to generate-site-content/1x sub directory
cd steeltoe-site-1x && bundle install && middleman build && cp -R ./build/docs ../generated-site-content/1x