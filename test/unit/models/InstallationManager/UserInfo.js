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
