'use strict';

var path = require('path');
var _ = require('lodash');

describe('M.Acccount', function() {

  var container = UNIT;

  var cleanup = function () {
    return promiseSeries([
      container.get('Location').query().delete(),
      container.get('Teacher').query().delete(),
      container.get('Account').query().delete(),
      container.get('User').query().delete(),
    ]);
  };

  beforeEach(cleanup);
  after(cleanup);

  var createTeacherAccount = function () {
    return container
      .create('User', {
        email: 'user-account-test@example.com',
        password: '12345678',
      })
      .then(function (user) {
        return container.create('Account', {
          userId: user.id,
          branchId: container.props.defaultBranchId,
          type: 'Teacher',
        });
      });
  };

  it('Should save Account Type data on save', function () {
    return createTeacherAccount()
      .then(function (acc) {
        return acc.getTypeInfo();
      })
      .then(function (acc) {
        expect(acc.active).to.equal(false);
        expect(acc.typeInfo.active).to.equal(false);

        acc.active = true; // should be reflected in acc.typeInfo
        expect(acc.active).to.equal(true);
        expect(acc.typeInfo.active).to.equal(true);

        return container.update(acc);
      })
      .then(function (acc) {
        return container.query('Teacher').where('account_id', acc.id);
      })
      .then(function (res) {
        expect(res[0].active).to.equal(true);
      });
  });

  it('Should create Location if provided .location property', function () {
    return container
      .create('User', {
        email: 'user-account-test@example.com',
        password: '12345678',
      })
      .then(function (user) {
        return container
          .create('Account', {
            userId: user.id,
            branchId: container.props.defaultBranchId,
            type: 'Teacher',
            location: {
              name: 'something',
              address1: 'something',
              address2: 'something',
              city: 'something',
              state: 'something',
              country: 'something',
              postalCode: 'something',
              latitude: 'something',
              longitude: 'something',
            },
          });
      })
      .then(function (acc) {
        expect(acc.location).to.exist;
        expect(acc.location.id).to.exist;

        return container
          .query('Location')
          .where('id', acc.location.id);
      })
      .then(function (res) {
        expect(res.length).to.equal(1);
      });
  });

  describe('Methods', function () {

    beforeEach(createTeacherAccount);

    describe('#getTypeInfo', function () {

      it('Should have typeInfo related to User Type', function () {
        return container.get('Account').query()
          .then(function (res) {
            expect(res.length).to.equal(1);

            return res[0].getTypeInfo();
          })
          .then(function (acc) {
            expect(acc).to.have.ownProperty('branchId');
            expect(acc).to.have.ownProperty('active');
            expect(acc.active).to.equal(false);
          });
      });

    });

  });

  describe('Static methods', function () {

    beforeEach(createTeacherAccount);

    describe('::getById', function () {

      it('Should work through `container.get(Account).getById`', function () {
        return container.query('Account')
          .then(function (res) {
            expect(res.length).to.equal(1);

            return container.get('Account').getById(res[0].id);
          })
          .then(function(account) {
            expect(account).to.have.ownProperty('active');
          });
      });

    });

    describe('::getByUser', function () {

      it('Should work through `container.get(Account).getByUser`', function () {
        return container.query('Account')
          .then(function (res) {
            expect(res.length).to.equal(1);

            return container.get('Account').getByUser(res[0].userId, res[0].branchId);
          })
          .then(function (acc) {
            expect(acc).to.have.ownProperty('active');
          });
      });

    });

  });

  describe('Validations', function () {

    describe('userId', function () {

      it('Should fail if not a UUID', function (done) {
        container
          .create('Account', {
            userId: 'asdf',
            branchId: container.props.defaultBranchId,
            type: 'Teacher',
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.userId).to.exist;
              expect(err.errors.userId.message).to.equal('The userId must be a valid uuid');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('branchId', function () {

      it('Should fail if undefined', function (done) {
        container
          .create('Account', {
            userId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
            type: 'Teacher',
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.branchId).to.exist;
              expect(err.errors.branchId.message).to.equal('The branchId is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if not a valid UUID', function (done) {
        container
          .create('Account', {
            userId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
            branchId: 'asdfasdfasdf',
            type: 'Teacher',
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.branchId).to.exist;
              expect(err.errors.branchId.message).to.equal('The branchId must be a valid uuid');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('firstName', function () {

      it('Should fail if length exceeds 125 characters', function (done) {
        container
          .create('Account', {
            userId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
            branchId: container.props.defaultBranchId,
            type: 'Teacher',
            firstName: _.repeat('a', 126),
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.firstName).to.exist;
              expect(err.errors.firstName.message).to.equal('The firstName must not exceed 125 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('lastName', function () {

      it('Should fail if length exceeds 125 characters', function (done) {
        container
          .create('Account', {
            userId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
            branchId: container.props.defaultBranchId,
            type: 'Teacher',
            lastName: _.repeat('a', 126),
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.lastName).to.exist;
              expect(err.errors.lastName.message).to.equal('The lastName must not exceed 125 characters long');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('dob', function () {

      it('Should work if a Date `new Date()` object', function () {
        return createTeacherAccount()
          .then(function (acc) {
            acc.dob = new Date();

            return container.update(acc);
          })
      });

      it('Should fail if not a Date object', function (done) {
        container
          .create('Account', {
            userId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
            branchId: container.props.defaultBranchId,
            type: 'Teacher',
            dob: 'asdf'
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.dob).to.exist;
              expect(err.errors.dob.message).to.equal('The dob must be a Date');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('locationId', function () {

      it('Should fail if not a UUID', function (done) {
        container
          .create('Account', {
            userId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
            branchId: container.props.defaultBranchId,
            type: 'Teacher',
            locationId: 'asdf',
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.locationId).to.exist;
              expect(err.errors.locationId.message).to.equal('The locationId must be a valid uuid');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });


      it('Should fail if Location does not exist', function (done) {
        container
          .create('Account', {
            userId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
            branchId: container.props.defaultBranchId,
            type: 'Teacher',
            locationId: '6c1c39c8-e267-406a-ba59-82243c2c14e0',
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.locationId).to.exist;
              expect(err.errors.locationId.message).to.equal('The locationId must exist');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

  });

  describe('Relations', function () {

    describe('location', function () {

      it('Should return valid M.Location model', function () {
        return container
          .create('User', {
            email: 'user-account-test@example.com',
            password: '12345678',
          })
          .then(function (user) {
            return container
              .create('Account', {
                userId: user.id,
                branchId: container.props.defaultBranchId,
                type: 'Teacher',
                location: {
                  name: 'something',
                  address1: 'something',
                  address2: 'something',
                  city: 'something',
                  state: 'something',
                  country: 'something',
                  postalCode: 'something',
                  latitude: 'something',
                  longitude: 'something',
                },
              });
          })
          .then(function (acc) {
            return container
              .query('Account')
              .where('id', acc.id)
              .include('location');
          })
          .then(function (res) {
            expect(res.length).to.equal(1);
            expect(res[0].location).to.exist;
            expect(res[0].location.id).to.exist;
          });
      });

    });

  });

});
