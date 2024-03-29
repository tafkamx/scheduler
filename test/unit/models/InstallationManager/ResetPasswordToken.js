'use strict';

var path = require('path');

var globalUser;

describe('InstallationManager.ResetPasswordToken', function () {

  before(function (done) {
    var user = new InstallationManager.User({
      email: 'user-test@example.com',
      password: '12345678',
      role: 'admin'
    });

    user.save()
      .then(function () {
        globalUser = user;
        return done();
      })
      .catch(done);
  });

  describe('Relations', function () {

    describe('user', function () {

      it('Should return a proper User object', function (doneTest) {
        var token;

        Promise.resolve()
          .then(function (result) {
            token = new InstallationManager.ResetPasswordToken({
              userId: globalUser.id,
            })

            return token.save();
          })
          .then(function () {
            return InstallationManager.ResetPasswordToken.query()
              .where('user_id', globalUser.id)
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
            return token.destroy();
          })
          .then(function () {
            return doneTest();
          })
          .catch(doneTest);
      });

    });

  });

  describe('Validations', function () {

    it('Should create a proper token with no errors', function (doneTest) {
      var token;

      Promise.resolve()
        .then(function () {
          return InstallationManager.User.query();
        })
        .then(function (result) {
          token = new InstallationManager.ResetPasswordToken({
            userId: result[0].id,
          })

          return token.save();
        })
        .then(function () {
          return token.destroy();
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
          return InstallationManager.User.query();
        })
        .then(function (result) {
          token = new InstallationManager.ResetPasswordToken({})

          return token.save();
        })
        .then(function () {
          return doneTest(new Error('should have failed before this'));
        })
        .catch(function (err) {
          return doneTest();
        });
    });

  });

  after(function () {
    return truncate([
      InstallationManager.ResetPasswordToken,
      InstallationManager.User
    ]);
  });

});
