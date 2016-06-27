'use strict';

var path = require('path');
var _ = require('lodash');

describe('M.User', function () {

  var container = UNIT;

  after(function () {
    return Promise.all([
      container.get('User').query().delete(),
    ]);
  });

  describe('Validations', function () {

    beforeEach(function () {
      return Promise.all([
        container.get('User').query().delete(),
      ]);
    });

    after(function () {
      return Promise.all([
        container.get('User').query().delete(),
      ]);
    });

    describe('email', function () {

      it('Should fail if the email already exists', function (done) {
        return Promise.resolve()
          .then(function () {
            return container.create('User', {
              email: 'user-test@example.com',
              password: '12345678',
              role: 'student',
            });
          })
          .then(function () {
            return container.create('User', {
              email: 'user-test@example.com',
              password: '12345678',
              role: 'student',
            });
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.email.message).to.be.equal('The email already exists.')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the email is undefined', function (done) {
        return Promise.resolve()
          .then(function () {
            return container.create('User', {
              password: '12345678',
              role: 'student',
            });
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.email.message).to.be.equal('The email is required')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the email is empty', function (done) {
        return Promise.resolve()
          .then(function () {
            return container.create('User', {
              email: '1',
              password: '12345678',
              role: 'student',
            });
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.email.message).to.be.equal('The email must be a valid email address')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if the email is longer than 255 characters', function (done) {
        return Promise.resolve()
          .then(function () {
            return container.create('User', {
              email: _.repeat('a', 256),
              password: '12345678',
              role: 'student',
            });
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.email.message).to.be.equal('The email must be a valid email address')
              // expect(err.errors.email.message).to.be.equal('The email must not exceed 255 characters long')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

    describe('password', function () {

      it('Should fail if the password is shorter than 8 characters', function (done) {
        return Promise.resolve()
          .then(function () {
            return container.create('User', {
              email: 'user-test@example.com',
              password: '1234567',
              role: 'student',
            });
          })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.be.equal('1 invalid values');
              expect(err.errors.password.message).to.be.equal('The password must be at least 8 characters long')
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

  });

  describe('Class methods', function () {

    describe('::createWithAccount', function () {

      var branch;

      before(function () {
        return container
          .create('Branch', {
            name: 'test-branch',
          })
          .then(function (res) {
            branch = res;
          });
      });

      beforeEach(function () {
        return promiseSeries([
          container.get('User').query().delete(),
          container.get('Account').query().delete(),
        ]);
      });

      after(function () {
        return promiseSeries([
          container.get('User').query().delete(),
          container.get('Account').query().delete(),
          container.get('Branch').query().delete(),
        ]);
      });

      it('Should create User and its Account correctly', function () {
        return container.get('User')
          .createWithAccount({
            email: 'boop@mcgoo.net',
            password: '12345678',
          }, {
            branchId: container.props.defaultBranchId,
            type: 'teacher',
          })
          .then(function (res) {
            expect(res).to.have.property('user');
            expect(res).to.have.property('account');
            expect(res.user).to.have.property('id');
            expect(res.account).to.have.property('id');
          })
      });

    });

  });

  describe('Methods', function () {

    describe('#activate', function () {

      it('Should set this.token to null', function () {
        var user = new M.User({
          token: 'something',
        });

        expect(user.token).to.equal('something');

        user.activate();

        expect(user.token).to.equal(null);
      });

    });

  });

});
