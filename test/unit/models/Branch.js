var path = require('path');
var _ = require('lodash');

describe('M.Branch', function() {
  var container = UNIT;

  beforeEach(function () {
    return promiseSeries([
      container.get('Branch').query().delete().where('id', '!=', container.props.defaultBranchId),
      truncate(container.get('BranchSettings'))
    ]);
  });

  after(function () {
    return promiseSeries([
      container.get('Branch').query().delete().where('id', '!=', container.props.defaultBranchId),
      truncate(container.get('BranchSettings'))
    ]);
  });

  it('Should create a record', function () {
    return container
      .create('Branch', {
        name: 'toronto',
      });
  });

  describe('Validations', function () {

    describe('name', function () {

      it('Should fail if name is empty', function (done) {
        container
          .create('Branch', {
            name: '',
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.be.equal('The name is required')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if name contains non-alpha-numeric characters', function (done) {
        container
          .create('Branch', {
            name: 'abcd123$',
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.be.equal('The name must only contain alpha-numeric characters and dashes.')
            } catch (err) {
              return done(err);
            }

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
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.be.equal('The name already exists.')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the name is longer than 255 characters', function (done) {
        container
          .create('Branch', {
            name: _.repeat('a', 256),
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.name.message).to.be.equal('The name must not exceed 255 characters long')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

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
            return container.query('Branch')
              .where('id', '!=', container.props.defaultBranchId)
              .include('settings');
          })
          .then(function (res) {
            expect(res[0]).to.be.instanceof(M.Branch);
            expect(res[0].settings).to.be.instanceof(M.BranchSettings);
          });
      });

    });

  });

  describe('Events', function () {

    describe('beforeCreate', function () {

      it('Should create M.BranchSettings instance if provided .settings', function () {
        return container
          .create('Branch', {
            name: 'something',
            settings: {
              language: 'en-CA',
              currency: 'CAD',
              timezone: 'America/Toronto',
            },
          })
          .then(function (res) {
            expect(res).to.have.property('id');
            expect(res.settings).to.have.property('id');
            expect(res.settings).to.have.property('branchId');
            expect(res.settings.branchId).to.equal(res.id);
          });
      });

    });

  });

});
