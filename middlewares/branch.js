'use strict';

module.exports = function (req, res, next) {
  if (CONFIG.environment === 'test') {
    return next();
  }

  Promise.resolve()
    .then(function () {
      return req.container.query('Branch')
        .where('name', req.branch);
    })
    .then(function (res) {
      if (res.length === 0) {
        return next(new NotFoundError('Branch Not Found.'));
      }

      req.branchId = res[0].id;
    })
    .then(function () {
      next();
    })
    .catch(next);
};
