'use strict';

var _ = require('lodash');

describe('M.Location', function () {

  var container = UNIT;

  var cleanup = function () {
    return truncate(container.get('Location'));
  };

  beforeEach(cleanup);
  after(cleanup);

  var preset = {
    name: 'something',
    address1: 'something',
    address2: 'something',
    city: 'something',
    state: 'something',
    country: 'something',
    postalCode: 'something',
    latitude: 'something',
    longitude: 'something',
  };

  it('Should create record successfully', function () {
    return container.create('Location', preset);
  });

  describe('Validations', function () {

    describe('name', function () {

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.name = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('name');
              expect(err.errors.name.message).to.equal('The name must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('address1', function () {

      it('Should fail if undefined', function (done) {
        var data = _.clone(preset);
        data.address1 = undefined;

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('address1');
              expect(err.errors.address1.message).to.equal('The address1 is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.address1 = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('address1');
              expect(err.errors.address1.message).to.equal('The address1 must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('address2', function () {

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.address2 = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('address2');
              expect(err.errors.address2.message).to.equal('The address2 must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('city', function () {

      it('Should fail if undefined', function (done) {
        var data = _.clone(preset);
        data.city = undefined;

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('city');
              expect(err.errors.city.message).to.equal('The city is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.city = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('city');
              expect(err.errors.city.message).to.equal('The city must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('state', function () {

      it('Should fail if undefined', function (done) {
        var data = _.clone(preset);
        data.state = undefined;

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('state');
              expect(err.errors.state.message).to.equal('The state is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.state = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('state');
              expect(err.errors.state.message).to.equal('The state must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('country', function () {

      it('Should fail if undefined', function (done) {
        var data = _.clone(preset);
        data.country = undefined;

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('country');
              expect(err.errors.country.message).to.equal('The country is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.country = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('country');
              expect(err.errors.country.message).to.equal('The country must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('postalCode', function () {

      it('Should fail if undefined', function (done) {
        var data = _.clone(preset);
        data.postalCode = undefined;

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('postalCode');
              expect(err.errors.postalCode.message).to.equal('The postalCode is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.postalCode = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('postalCode');
              expect(err.errors.postalCode.message).to.equal('The postalCode must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('latitude', function () {

      it('Should fail if undefined', function (done) {
        var data = _.clone(preset);
        data.latitude = undefined;

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('latitude');
              expect(err.errors.latitude.message).to.equal('The latitude is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.latitude = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('latitude');
              expect(err.errors.latitude.message).to.equal('The latitude must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('longitude', function () {

      it('Should fail if undefined', function (done) {
        var data = _.clone(preset);
        data.longitude = undefined;

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('longitude');
              expect(err.errors.longitude.message).to.equal('The longitude is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if length exceeds 255 characters', function (done) {
        var data = _.clone(preset);
        data.longitude = _.repeat('a', 256);

        container
          .create('Location', data)
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors).to.have.property('longitude');
              expect(err.errors.longitude.message).to.equal('The longitude must not exceed 255 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

  });

});
