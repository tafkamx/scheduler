'use strict';

var path = require('path');

describe('M.InstallationSettings', function () {
  var container = UNIT;

  var settingsOptions = {
    language : 'en-CA',
    currency : 'CAD',
    timezone : 'America/Toronto'
  };

  beforeEach(function () {
    return Promise.all([
      container.get('InstallationSettings').query().delete(),
    ]);
  });

  it('Should create a record', function () {
    return container.create('InstallationSettings', settingsOptions);
  });

  it('Should delete all records when creating a new one', function () {
    return Promise.resolve()
      .then(function () {
        return container.create('InstallationSettings', settingsOptions);
      })
      .then(function () {
        return container.create('InstallationSettings', settingsOptions);
      })
      .then(function () {
        return container.query('InstallationSettings');
      })
      .then(function (result) {
        expect(result.length).to.equal(1);
      });
  });

  describe('Validations', function () {

    describe('language', function () {

      it('Should fail if language is invalid', function(done) {
        var options = {
          language : 'es-MX',
          currency : 'CAD',
          timezone : 'America/Toronto'
        };

        container.create('InstallationSettings', options)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.language.message).to.be.equal('Language is invalid.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('currency', function () {

      it('Should fail if currency is invalid', function(done) {
        var options = {
          language : 'en-CA',
          currency : 'MXP',
          timezone : 'America/Toronto'
        };

        container.create('InstallationSettings', options)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.currency.message).to.be.equal('Currency is invalid.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('timezone', function () {

      it('Should fail if timezone is invalid', function(done) {
        var options = {
          language : 'en-CA',
          currency : 'CAD',
          timezone : 'Canada'
        };

        container.create('InstallationSettings', options)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.timezone.message).to.be.equal('Timezone is invalid.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

  });

});
