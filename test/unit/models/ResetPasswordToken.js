'use strict';

var path = require('path');

var container = UNIT;

describe('M.ResetPasswordToken', function () {

  before(function (done) {
    container
      .create('User', {
        email: 'user-test@example.com',
        password: '12345678',
        role: 'student'
      })
      .then(function () {
        return done();
      })
      .catch(done);
  });

  after(function (done) {
    Promise.all([
      container.get('User').query().delete(),
      container.get('ResetPasswordToken').query().delete(),
    ])
      .then(function () {
        return done();
      })
      .catch(done);
  });

  describe('Relations', function () {

    describe('user', function () {

      it('Should return a proper User object', function (doneTest) {
        var token;

        Promise.resolve()
          .then(function () {
            return container.query('User');
          })
          .then(function (result) {
            return container.create('ResetPasswordToken', {
              userId: result[0].id,
            });
          })
          .then(function () {
            return container.query('ResetPasswordToken')
              .include('user')
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];

                expect(token).to.be.an('object');
                expect(token.constructor.className).to.equal('ResetPasswordToken');
                expect(token.user).to.be.an('object');
                expect(token.user.constructor.className).to.equal('User');
              });
          })
          .then(function () {
            container.destroy(token);
          })
          .then(function () {
            return doneTest();
          })
          .catch(doneTest);
      });

    });

  });

  describe('Checkit rules', function () {

    it('Should create a proper token with no errors', function (doneTest) {
      Promise.resolve()
        .then(function () {
          return container.query('User');
        })
        .then(function (result) {
          return container.create('ResetPasswordToken', {
            userId: result[0].id,
          });
        })
        .then(function (token) {
          return container.destroy(token);
        })
        .then(function () {
          return doneTest();
        })
        .catch(doneTest);
    });

    it('Should return error if no userId is provided', function (doneTest) {
      var token;

      Promise.resolve()
        .then(function () {
          return container.query('User');
        })
        .then(function (result) {
          return container.create('ResetPasswordToken', {
            userId: null,
          });
        })
        .then(function () {
          return doneTest(new Error('should have failed before this'));
        })
        .catch(function (err) {
          return doneTest();
        });
    });

  });

});
