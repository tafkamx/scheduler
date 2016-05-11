'use strict';

var path = require('path');

describe('M.BranchSettings', function() {
  var container = UNIT;

  beforeEach(function () {
    return Promise.all([
      container.get('Branch').query().delete(),
      container.get('BranchSettings').query().delete(),
      container.get('InstallationSettings').query().delete(),
    ]);
  });

  after(function () {
    return Promise.all([
      container.get('Branch').query().delete(),
      container.get('BranchSettings').query().delete(),
      container.get('InstallationSettings').query().delete(),
    ]);
  });

  it('Should create a record', function () {
    return Promise.resolve()
      .then(function () {
        return container.create('Branch', {
          name: 'ontario-please',
        });
      })
      .then(function (branch) {
        return container.create('BranchSettings', {
          language: 'en-CA',
          currency: 'CAD',
          timezone: 'America/Toronto',
          branchId: branch.id,
        });
      });
  });

  it('Should fail if language is invalid', function (done) {
    return container
      .create('BranchSettings', {
        language: 'es-MX',
        currency: 'CAD',
        timezone: 'America/Toronto',
      })
      .then(function () {
        expect.fail('should have rejected');
      })
      .catch(function (err) {
        expect(err).to.be.instanceof(Error);
        expect(err.errors.language.message).to.be.equal('Language is invalid.')

        done();
      });
  });

  it('Should fail if currency is invalid', function(done) {
    return container
      .create('BranchSettings', {
        language: 'es-CA',
        currency: 'MXP',
        timezone: 'America/Toronto',
      })
      .then(function () {
        expect.fail('should have rejected');
      })
      .catch(function (err) {
        expect(err).to.be.instanceof(Error);
        expect(err.errors.currency.message).to.be.equal('Currency is invalid.')

        done();
      });
  });

  it('Should fail if timezone is invalid', function(done) {
    return container
      .create('BranchSettings', {
        language: 'es-CA',
        currency: 'CAD',
        timezone: 'Canada',
      })
      .then(function () {
        expect.fail('should have rejected');
      })
      .catch(function (err) {
        expect(err).to.be.instanceof(Error);
        expect(err.errors.timezone.message).to.be.equal('Timezone is invalid.')

        done();
      });
  });

  it('Should fail if branchId is null', function(done) {
    return container
      .create('BranchSettings', {
        language: 'es-CA',
        currency: 'CAD',
        timezone: 'Canada',
      })
      .then(function () {
        expect.fail('should have rejected');
      })
      .catch(function (err) {
        expect(err).to.be.instanceof(Error);
        expect(err.errors.branchId.message).to.be.equal('The branchId is required')

        done();
      });
  });

  describe('Relations', function () {

    describe('branch', function () {

      it('Should load the branch relation', function () {
        return Promise.resolve()
          .then(function () {
            return container.create('Branch', {
              name: 'Ottawa',
            });
          })
          .then(function (branch) {
            return container.create('BranchSettings', {
              language: 'en-CA',
              currency: 'CAD',
              timezone: 'America/Toronto',
              branchId: branch.id,
            });
          })
          .then(function () {
            return container.query('BranchSettings').include('branch');
          })
          .then(function (res) {
            expect(res[0].branch).to.be.instanceof(M.Branch);
          });
      });

    });

  });

  describe('Methods', function () {

    describe('#getInstallationSettings', function () {

      it('Should create a record from with the same InstallationSettings', function () {
        return Promise.resolve()
          .then(function () {
            return container.create('InstallationSettings', {
              language: 'en-CA',
              currency: 'CAD',
              timezone: 'America/Toronto',
            });
          })
          .then(function () {
            return container.create('Branch', {
              name: 'Abbotsford',
            });
          })
          .then(function (branch) {
            var Model = container.get('BranchSettings');

            var settings = new Model({
              branchId: branch.id,
            });

            return settings
              .getInstallationSettings()
              .then(function () {
                return container.update(settings);
              });
          });
      });

    });

  });

});
