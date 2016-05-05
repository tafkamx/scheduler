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

Promise.resolve()
  .then(function () {
    glob.sync('test/integration/InstallationManager/**/*.js').forEach(function (file) {
      mocha.addFile(path.join(process.cwd(), file));
    });

    return Promise.resolve();
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
