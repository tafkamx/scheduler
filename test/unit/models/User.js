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


  it('Should be an object', function (done) {
    done();
  });

});
