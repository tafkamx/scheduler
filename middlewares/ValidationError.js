'use strict';

var Checkit = require('checkit');

module.exports = function (err, req, res, next) {
  if (!err.errors || !(err instanceof Checkit.Error)) {
    return next(err);
  }

  logger.error('Validation error', err.stack, err.errors);

  res.status(400);

  res.format({
    json: function () {
      return res.json(err.errors);
    },
  });
};
