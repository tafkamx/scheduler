'use strict';

var path = require('path');

var agent = sa.agent();

describe('InstallationManager.UserInfo', function () {

  before(function (done) {
    var user = new InstallationManager.User({
      email: 'user-test@example.com',
      password: '12345678',
      role: 'admin'
    });

    user.save()
      .then(function () {
        return done();
      })
      .catch(done);
  });

  describe('Relations', function () {

    describe('user', function () {

      it('Should return a proper User object', function (doneTest) {
        InstallationManager.UserInfo.query()
          .include('user')
          .then(function (result) {
            expect(result.length).to.equal(1);

            var info = result[0];

            expect(info).to.be.an('object');
            expect(info.constructor.className).to.equal('UserInfo');
            expect(info.user).to.be.an('object');
            expect(info.user.constructor.className).to.equal('User');
          })
          .then(doneTest)
          .catch(doneTest);
      });

    });

  });

  describe('Constraints', function () {

    describe('user_id', function () {

      it('Should delete UserInfo record when User record is deleted', function (doneTest) {
        var user,
          userId;

        return Promise.resolve()
          .then(function () {
            user = new InstallationManager.User({
              email: 'user-test-2@example.com',
              password: '12345678',
              role: 'admin'
            });

            return user.save();
          })
          .then(function () {
            userId = user.id;

            return InstallationManager.UserInfo.query()
              .where('user_id', user.id)
              .then(function (result) {
                expect(result.length).to.equal(1);
              });
          })
          .then(function () {
            return user.destroy();
          })
          .then(function () {
            return InstallationManager.UserInfo.query()
              .where('id', userId)
              .then(function (result) {
                expect(result.length).to.equal(0);
              });
          })
          .then(doneTest)
          .catch(doneTest);
      });

    });

  });

  after(function (done) {
    Promise.all([
      InstallationManager.User.query().delete(),
      InstallationManager.UserInfo.query().delete()
    ])
      .then(function () {
        return done();
      })
      .catch(done);
  });

});
