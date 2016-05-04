global.expect = require('chai').expect;
global.sa = require('superagent');

var Promise = require('bluebird');
var path = require('path');

var DomainContainer = require('domain-container');

var glob = require('glob');
var Mocha = require('mocha');

var mocha = new Mocha();
mocha.reporter('spec');

global.baseURL = 'http://localhost:3000';

require(path.join(process.cwd(), '/bin/server.js'));

glob.sync('test/unit/**/*.js').forEach(function (file) {
  mocha.addFile(path.join(process.cwd(), file));
});

global.UNIT;

var unitInstall;

Promise.resolve()
  .then(function () {
    unitInstall = new InstallationManager.Installation({
      name: 'installation-unit',
    });

    return unitInstall.save();
  })
  .then(function () {
    UNIT = new DomainContainer({
      knex: unitInstall.getDatabase(),
      models: M,
    });

    // run Mocha
    mocha.run(function (failures) {
      process.on('exit', function () {
        process.exit(failures);
      });
      process.exit();
    });
  })
  .catch(console.error.bind(console));


/*
Promise.resolve()
  .then(function () {

    return Promise.resolve();
  })
  .then(function () {
    // controllers
    require(path.join(__dirname, '/integration/controllers/InstallationManager/UsersController'));
    require(path.join(__dirname, '/integration/controllers/InstallationManager/InstallationsController'));
    require(path.join(__dirname, '/integration/controllers/InstallationManager/SessionsController'));
    require(path.join(__dirname, '/integration/controllers/BranchesController'));
    require(path.join(__dirname, '/integration/controllers/UsersController'));
    require(path.join(__dirname, '/integration/controllers/SessionsController'));

    return Promise.resolve();
  })
  .then(function () {
    // create unit tests installation
    return Promise.resolve();
  })
  .then(function () {
    // run unit tests

    return Promise.resolve();
  })
  .then(function () {
  })
*/
