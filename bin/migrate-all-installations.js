'use strict';

var path = require('path');
var neonode = require(path.join(process.cwd(), 'lib', 'core'));

InstallationManager.Installation.query()
  .then(function (installations) {
    return Promise.all(installations.map(function (i) {
      return i.migrate();
    }));
  })
  .then(function () {
    logger.info('migrate-all-installations: Migrated all installations successfully.');
    process.exit(0);
  })
  .catch(function (err) {
    logger.error('migrate-all-installations error', err);
    process.exit(1);
  });
