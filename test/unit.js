global.expect = require('chai').expect;
global.sa = require('superagent');

var Promise = require('bluebird');
var path = require('path');

var DomainContainer = require('domain-container');

var glob = require('glob');
var Mocha = require('mocha');

var mocha = new Mocha();
mocha.reporter('spec');

require(path.join(process.cwd(), '/bin/server.js'));

global.UNIT;

var unitInstall;

Promise.resolve()
  .then(function () {
    unitInstall = new InstallationManager.Installation({
      name: 'installation-unit',
    });

    return Promise.all([
      unitInstall.save(),
    ]);
  })
  .then(function () {
    glob.sync('test/unit/**/*.js').forEach(function (file) {
      mocha.addFile(path.join(process.cwd(), file));
    });

    return Promise.resolve();
  })
  .then(function () {
    UNIT = new DomainContainer({
      knex: unitInstall.getDatabase(),
      models: M,
    });
  })
  .then(function () {
    // run Mocha
    mocha.run(function (failures) {
      process.on('exit', function () {
        process.exit(failures);
      });
      process.exit();
    });
  })
  .catch(function (err) {
    console.error(err);
    console.error(err.stack);
  });
