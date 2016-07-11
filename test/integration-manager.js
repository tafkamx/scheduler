global.expect = require('chai').expect;
global.sa = require('superagent');
global.Promise = require('bluebird');
var _ = require('lodash');

var path = require('path');

global.truncate = (models) => {
  if (!_.isArray(models)) {
    models = [models];
  }

  return Promise.each(models, function (model) {
    return model.knex().raw('truncate table "' + model.tableName + '" cascade');
  });
};

global.promiseSeries = require(path.join(process.cwd(), 'lib', 'utils', 'promise-all-series.js'));

var DomainContainer = require('domain-container');

var glob = require('glob');
var Mocha = require('mocha');

var mocha = new Mocha();
mocha.reporter('spec');

global.baseURL = 'http://localhost:3000';

require(path.join(process.cwd(), '/bin/server.js'));

Promise.resolve()
  .then(function () {
    glob.sync('test/integration/InstallationManager/**/*.js')
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
