'use strict';

var path = require('path');
var _ = require('lodash');

describe('InstallationManager.User', function () {

  after(function () {
    return truncate(InstallationManager.User);
  });

  describe('Validations', function () {

    beforeEach(function () {
      return truncate(InstallationManager.User);
    });

    after(function () {
      return truncate(InstallationManager.User);
    });

    describe('email', function () {

      it('Should fail if the email already exists', function (done) {
        return Promise.resolve()
          .then(function () {
            return new InstallationManager.User({
              email: 'user-test@example.com',
              password: '12345678',
            }).save();
          })
          .then(function () {
            return new InstallationManager.User({
              email: 'user-test@example.com',
              password: '12345678',
            }).save();
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
            return new InstallationManager.User({
              password: '12345678',
            }).save();
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
            return new InstallationManager.User({
              email: '1',
              password: '12345678',
            }).save();
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
            return new InstallationManager.User({
              email: _.repeat('a', 256),
              password: '12345678',
            }).save();
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
            return new InstallationManager.User({
              email: 'user-test@example.com',
              password: '1234567',
            }).save();
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
});
