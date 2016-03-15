# [Neon.js][3] powered MVC Full-Stack development Anti-Framework.
[![npm-image](https://img.shields.io/npm/v/generator-neonode.svg?style=flat-square)](https://www.npmjs.com/package/generator-neonode)

## Usage


## Dependencies


## Setup

### Config

You will need to create the `config.js` file.

### Knex files

You will need to create the `KnexInstallationAdmin.js` and `knexfile.js` files.

### Hosts

Add the following to your `/etc/hosts` file:

```
#### PatOS ####

127.0.0.1 default.installation-one.test-installation.com
127.0.0.1 installation-one.test-installation.com
127.0.0.1 default.installation-one.test-installation.com
127.0.0.1 installation-one.test-installation.com

127.0.0.1 default.installation-two.test-installation.com
127.0.0.1 default.installation-two.test-installation.com
127.0.0.1 installation-two.test-installation.com
127.0.0.1 installation-two.test-installation.com
127.0.0.1 default.installation-three.test-installation.com
```

## Run the server

```
$ npm start
```

## Database Migrations

Neonode uses [Knex][1] to access databases and you can use it to generate queries and migrate the DB. Read [Knex Migrations][2]

## Controllers Generator

## Models

## Middlewares


## Credits

Neonode is possible thanks to these wonderful libraries

[Neon][3]

[Thulium][4]

[Lithium][5]

[Argon][6]

[Krypton][9]

[Fluorine][7]

[Cobalt][8]


[1]: http://knexjs.org/
[2]: http://knexjs.org/#Migrations
[3]: https://github.com/azendal/neon
[4]: https://github.com/freshout-dev/thulium
[5]: https://github.com/freshout-dev/lithium
[6]: https://github.com/sgarza/argon/tree/node-callback-convention
[7]: https://github.com/freshout-dev/fluorine
[8]: https://github.com/benbeltran/cobalt
[9]: https://github.com/sgarza/krypton
