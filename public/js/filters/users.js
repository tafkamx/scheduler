'use strict';

var _ = require('lodash');

module.exports = function (users) {
  var toLoop = users;

  if (_.isObject(users)) {
    toLoop = [users];
  }

  toLoop.forEach(function (user) {
    delete user.encryptedPassword;
    delete user.token;
    delete user.password;
  });

  return users;
};
