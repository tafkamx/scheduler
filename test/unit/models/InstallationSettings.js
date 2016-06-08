'use strict';

var path = require('path');

describe('M.InstallationSettings', function () {
  var container = UNIT;

  var settingsOptions = {
    language : 'en-CA',
    currency : 'CAD',
    timezone : 'America/Toronto'
  };

  var user;

  before(function () {
    return container
      .create('User', {
        email: 'user-test@example.com',
        password: '12345678',
      })
      .then(function (res) {
        user = res;
        settingsOptions.franchisorId = res.id;
      });
  });

  beforeEach(function () {
    return Promise.all([
      container.get('InstallationSettings').query().delete(),
    ]);
  });

  after(function () {
    return promiseSeries([
      container.get('User').query().delete(),
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
          timezone : 'America/Toronto',
          franchisorId: user.id,
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
          timezone : 'America/Toronto',
          franchisorId: user.id,
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
          timezone : 'Canada',
          franchisorId: user.id,
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

    describe('franchisorId', function () {

      it('Should fail if undefined', function (done) {
        var options = {
          language: 'en-CA',
          currency: 'CAD',
          timezone: 'America/Toronto',
        };

        container.create('InstallationSettings', options)
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.franchisorId.message).to.be.equal('The franchisorId is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if not a UUID', function (done) {
        var options = {
          language: 'en-CA',
          currency: 'CAD',
          timezone: 'America/Toronto',
          franchisorId: '123123123123',
        };

        container.create('InstallationSettings', options)
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.franchisorId.message).to.be.equal('The franchisorId must be a valid uuid');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if User does not exist', function (done) {
        var options = {
          language: 'en-CA',
          currency: 'CAD',
          timezone: 'America/Toronto',
          franchisorId: '6E37B8FE-1C76-11E6-A5F8-5E260608D449',
        };

        container.create('InstallationSettings', options)
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.franchisorId.message).to.be.equal('The franchisorId does not exist.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

  });

});
