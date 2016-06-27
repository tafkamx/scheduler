global.expect = require('chai').expect;
global.sa = require('superagent');
global.Promise = require('bluebird');

var path = require('path');

global.promiseSeries = require(path.join(process.cwd(), 'lib', 'utils', 'promise-all-series.js'));

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
    glob.sync('test/unit/**/*.js')
      .filter(function (filePath) {
        var fileName = path.parse(filePath).base;

        return (fileName.indexOf(process.argv[2]) !== -1)
      })
      .forEach(function (file) {
        mocha.addFile(path.join(process.cwd(), file));
      });

    return Promise.resolve();
  })
  .then(function () {
    UNIT = new DomainContainer({
      knex: unitInstall.getDatabase(),
      models: M,
      modelExtras: {
        mailers: {
          user: new UserMailer({
            baseUrl: 'http://default.installation-unit.test-installation.com:3000',
          }),
        },
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
    logger.error(err, err.stack);
    process.exit(1);
  });
