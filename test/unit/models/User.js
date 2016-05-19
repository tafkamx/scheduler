'use strict';

var path = require('path');
var _ = require('lodash');

var container = UNIT;

describe('M.User', function () {

  before(function (done) {
    container
      .create('User', {
        email: 'user-test@example.com',
        password: '12345678'
      })
      .then(function () {
        return done();
      })
      .catch(done);
  });

  after(function (done) {
    Promise.all([
      container.get('User').query().delete(),
    ])
      .then(function () {
        return done();
      })
      .catch(done);
  });


  describe('email', function () {
    it('Should fail if the email already exists', function (done) {
      return Promise.resolve()
        .then(function () {
          return container.create('User', {
            email: 'user-test@example.com',
            password: '12345678',
          });
        })
        .then(function () {
          return container.create('User', {
            email: 'user-test@example.com',
            password: '12345678',
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
          });
        })
        .then(function () {
          expect.fail('should have rejected');
        })
        .catch(function (err) {
          try {
            //expect(err.message).to.be.equal('1 invalid values');
            expect(err.errors.password.message).to.be.equal('The password must be at least 8 characters long')
          } catch (err) {
            return done(err);
          }

          done();
        });
    });

  });

});
