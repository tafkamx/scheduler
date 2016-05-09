'use strict';

var path = require('path');

var container = UNIT;

describe('M.UserInfo', function () {

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
      container.get('UserInfo').query().delete(),
    ])
      .then(function () {
        return done();
      })
      .catch(done);
  });

  describe('Relations', function () {

    describe('user', function () {

      it('Should return a proper User object', function (doneTest) {
        container.query('UserInfo')
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

});
