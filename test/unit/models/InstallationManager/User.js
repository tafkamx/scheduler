'use strict';

var path = require('path');

describe('InstallationManager.User', function () {

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
      .catch(function(err) {
        throw err;
      });
  });

  describe('Relations', function () {

    describe('info', function () {

      it('Should return a proper UserInfo object', function (doneTest) {
        InstallationManager.User.query()
          .include('info')
          .then(function (result) {
            expect(result.length).to.equal(1);

            var user = result[0];

            expect(user).to.be.an('object');
            expect(user.constructor.className).to.equal('User');
            expect(user.info).to.be.an('object');
            expect(user.info.constructor.className).to.equal('UserInfo');
          })
          .then(doneTest)
          .catch(function(err) {
            throw err;
          });
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
