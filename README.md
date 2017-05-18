# ARCHIE :blush:

> Archie the Architect aims to be a full-featured static website generator and front end framework, built with the philosophy of components. Only use the features you want.

## Configuration file

Default config: `./archie.js`

The default configuration file is `./archie.js`. You can change the location or type of config file; `js`, `json`, or `yaml` files are supported, though `.js` files are more flexible and parse faster.

## Bundles and globs

_Bundles_ are the heart of archie. A bundle is a task -- or set of commands -- which defines how to process one or more _globs_ of files. A bundle can be compared to a gulp task.
