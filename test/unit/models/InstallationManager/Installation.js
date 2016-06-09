'use strict';

var path = require('path');
var Knex = require('knex');
var _ = require('lodash');

describe('InstallationManager.Installation', function () {

  describe('Validations', function () {

    describe('name', function () {

      it('Should fail if the name contains non-alpha-numeric characters', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.Installation({
              name: 'sp ace',
            }).save();
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.equal('name must only contain alpha-numeric characters and dashes.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the name is empty', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.Installation({
              name: '',
            }).save();
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.equal('The name is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the name is undefined', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.Installation({}).save();
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.equal('The name is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the name exists', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.Installation({
              name: 'installation-unit',
            }).save();
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.equal('name already exists.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the name is > 128', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.Installation({
              name: _.repeat('a', 129),
            }).save();
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.equal('The name must not exceed 128 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('domain', function () {

      it('Should fail to create an Installation if the domain is not a valid domain with TLD', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.Installation({
              name: 'sp ace',
              domain: 'patos.notvalid',
            }).save();
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('2 invalid values');
              expect(err.errors.domain.message).to.equal('Invalid domain.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the domain is > 255', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.Installation({
              name: 'sp ace',
              domain: _.repeat('a', 256),
            }).save();
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('2 invalid values');
              expect(err.errors.domain.message).to.equal('The domain must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

  });

  describe('Class methods', function () {

    describe('::createInstallation', function () {
      this.timeout(4000);

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
        return Promise
          .all([
            InstallationManager.Installation.query()
              .where('name', 'boop')
              .delete(),
            knex.raw('DROP DATABASE IF EXISTS "boop-test"'),
          ])
          .then(function () {
            return knex.destroy();
          });
      });

      it('Should create installation', function () {
        return Promise.resolve()
          .then(function () {
            return InstallationManager.Installation.createInstallation({
              installation: {
                name: 'boop',
              },
              franchisor: {
                email: 'franchisor@example.com',
              },
              baseUrl: 'patos.net',
              installationSettings: {
                language: 'en-CA',
                currency: 'CAD',
                timezone: 'America/Toronto',
              },
              defaultBranchSettings: {
                language: 'en-CA',
                currency: 'CAD',
                timezone: 'America/Toronto',
              }
            });
          })
          .then(function (installation) {
            var knex = installation.getDatabase();

            return knex('Branches')
              .then(function (res) {
                expect(res.length).to.equal(1);
              })
              .then(knex.destroy);
          })
      });

    });

  });

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
