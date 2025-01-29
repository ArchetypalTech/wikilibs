![Arcetypal Repo](./archetypal-heading.jpg)
# Wikilibs
[![npm version](https://badge.fury.io/js/@archetypaltech%2Fwikilibs.svg)](https://badge.fury.io/js/@archetypaltech%2Fwikilibs)

Core wiki generator, routes and paths for menu directories

A Libray to keep Wiki features upto date.

To be consumed by an instance from the template repo https://github.com/ArchetypalTech/wiki-host-instance

## prepareDirectoryStructure
This will generate the empty neccessary directory structure for a new wiki to operate under. 

## generateWiki
This method is used by the Dockerfile and more precisely the build command, which will pre generate neccessary _flavoured_ markdown content / seo, routes, images and menu tree.