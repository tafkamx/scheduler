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
    glob.sync('test/integration/installation/**/*.js')
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
    INTE = new DomainContainer({
      knex: inteInstall.getDatabase(),
      models: M,
      props: {
        url: 'http://default.installation-inte.test-installation.com:3000',
      },
      modelExtras: {
        mailers: {
          user: new UserMailer(),
        },
      },
    });
  })
  .then(function () {
    return INTE.create('Branch', {
      name: 'default',
    });
  })
  .then(function (res) {
    INTE.props.defaultBranchId = res.id;
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
