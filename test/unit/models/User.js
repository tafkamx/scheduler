'use strict';

var path = require('path');

var container = UNIT;

describe('M.User', function () {

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
    ])
      .then(function () {
        return done();
      })
      .catch(done);
  });

  describe('Relations', function () {

    describe('info', function () {

      it('Should return a proper UserInfo object', function (doneTest) {
        container.query('User')
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
          .catch(doneTest);
      });

    });

  });

});
