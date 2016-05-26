'use strict';

var Promise = require('bluebird');

/**
 * Executes the promises in the passed-in array in the order they were
 * passed-in, doesn't execute the next promise until the current one
 * resolves, only works as intended with Krypton/Knex promises, which
 * only execute when the .then() is called and not as soon as they are
 * defined.
 *
 * @method promiseSeries
 * @param {Array} promises Promises to execute
 * @return {Promise} promise Last promise that was executed
 */
module.exports = function (promises) {
  return promises.reduce(function (prev, cur) {
    return prev.then(function () {
      return cur;
    });
  }, Promise.resolve());
};
