global.expect = require('chai').expect;
global.sa = require('superagent');
global.Promise = require('bluebird');

var path = require('path');

var DomainContainer = require('domain-container');

var glob = require('glob');
var Mocha = require('mocha');

var mocha = new Mocha();
mocha.reporter('spec');

require(path.join(process.cwd(), '/bin/server.js'));

global.INTE;

var inteInstall;

Promise.resolve()
  .then(function () {
    inteInstall = new InstallationManager.Installation({
      name: 'installation-inte',
    });

    return Promise.all([
      inteInstall.save(),
    ]);
  })
  .then(function () {
    glob.sync('test/integration/installation/**/*.js').forEach(function (file) {
      mocha.addFile(path.join(process.cwd(), file));
    });

    return Promise.resolve();
  })
  .then(function () {
    INTE = new DomainContainer({
      knex: inteInstall.getDatabase(),
      models: M,
      props: {
        url: 'http://default.installation-inte.test-installation.com:3000',
      },
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