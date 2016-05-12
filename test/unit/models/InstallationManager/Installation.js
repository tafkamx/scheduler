'use strict';

var path = require('path');
var Knex = require('knex');

describe('InstallationManager.Installation', function () {

  describe('Methods', function () {

    describe('#createDatabase', function () {

      var knex = Knex(CONFIG.database[CONFIG.environment]);

      beforeEach(function () {
        return Promise.all([
          InstallationManager.Installation.query()
            .where('name', 'boop')
            .delete(),
          knex.raw('DROP DATABASE IF EXISTS "boop-test"'),
        ]);
      });

      after(function () {
        return Promise.all([
          InstallationManager.Installation.query()
            .where('name', 'boop')
            .delete(),
          knex.raw('DROP DATABASE IF EXISTS "boop-test"'),
        ]);
      });

      after(function () {
        return knex.destroy();
      });

      it('Should not throw error if DB already exists', function () {
        var install = new InstallationManager.Installation({
          name: 'boop',
        });

        return Promise.resolve()
          .then(function () {
            return install.save();
          })
          .then(function () {
            return install.createDatabase();
          });
      });

    });

  });

});
