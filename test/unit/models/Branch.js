var path = require('path');

describe('M.Branch', function() {
  var container = UNIT;

  beforeEach(function () {
    return Promise.all([
      container.get('Branch').query().delete(),
      container.get('BranchSettings').query().delete(),
    ]);
  });

  after(function () {
    return Promise.all([
      container.get('Branch').query().delete(),
      container.get('BranchSettings').query().delete(),
    ]);
  });

  it('Should create a branch', function () {
    return container
      .create('Branch', {
        name: 'toronto',
      });
  });

  it('Should fail if name is invalid', function (done) {
    container
      .create('Branch', {
        name: 'Thunder Bay',
      })
      .then(function () {
        expect.fail('should have rejected');
      })
      .catch(function (err) {
        expect(err.message).to.be.equal('1 invalid values');
        expect(err.errors.name.message).to.be.equal('The name must only contain alpha-numeric characters and dashes.')

        done();
      });
  });

  it('Should fail if name already exists', function (done) {
    return container
      .create('Branch', {
        name: 'toronto',
      })
      .then(function () {
        return container
          .create('Branch', {
            name: 'toronto',
          });
      })
      .then(function () {
        expect.fail('should have rejected');
      })
      .catch(function (err) {
        expect(err.message).to.be.equal('1 invalid values');
        expect(err.errors.name.message).to.be.equal('The name already exists.')

        done();
      });
  });

  describe('Relations', function () {

    describe('settings', function () {

      it('Should load the settings relation', function () {
        return Promise.resolve()
          .then(function () {
            return container.create('Branch', {
              name: 'Vancouver',
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
          .then(function (set) {
            return container.query('Branch').include('settings');
          })
          .then(function (res) {
            expect(res[0]).to.be.instanceof(M.Branch);
            expect(res[0].settings).to.be.instanceof(M.BranchSettings);
          });
      });

    });

  });

});
