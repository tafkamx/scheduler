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

  /**
  describe('Relations', function () {

  });*/

});
