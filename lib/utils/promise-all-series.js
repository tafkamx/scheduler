'use strict';

var Promise = require('bluebird');

module.exports = function (promises) {
  return promises.reduce(function (prev, cur) {
    return prev.then(function () {
      return cur;
    });
  }, Promise.resolve());
};
