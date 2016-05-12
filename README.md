# PatOS

## Setup

### Config

You will need to create the `config/config.js` file.  You can copy the default
one (filling in the missing bits) by copying the `config/config.sample.js` file.

### Knex files

You will need to create the `knexinstallationmanager.js` and `knexfile.js`
files.  These also have default files under `config/`.

### Hosts

Add the following to your `/etc/hosts` file:

```
#### PatOS ####

127.0.0.1 default.installation-one.test-installation.com
127.0.0.1 installation-one.test-installation.com

127.0.0.1 default.installation-two.test-installation.com
127.0.0.1 installation-two.test-installation.com

127.0.0.1 default.three.test-installation.com
127.0.0.1 three.test-installation.com

127.0.0.1 default.installation-inte.test-installation.com
127.0.0.1 installation-inte.test-installation.com

127.0.0.1 default.installation-unit.test-installation.com
127.0.0.1 installation-unit.test-installation.com
```

## Run the server

```
$ npm start
```

## Database Migrations

TODO, because of the different migration folders.

## Credits

Neonode is possible thanks to these wonderful libraries

- [Neon][3]
- [Thulium][4]
- [Lithium][5]
- [Argon][6]
- [Krypton][9]
- [Fluorine][7]
- [Cobalt][8]

[3]: https://github.com/azendal/neon
[4]: https://github.com/freshout-dev/thulium
[5]: https://github.com/freshout-dev/lithium
[6]: https://github.com/sgarza/argon/tree/node-callback-convention
[7]: https://github.com/freshout-dev/fluorine
[8]: https://github.com/benbeltran/cobalt
[9]: https://github.com/sgarza/krypton
