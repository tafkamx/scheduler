'use strict';

module.exports = function (req, res, next) {
  res.once('finish', function () {
    if (req.knex) {
      req.knex.destroy(function () {});
    }
  });

  return next();
};
