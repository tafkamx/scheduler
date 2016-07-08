'use strict';

module.exports = function (req, res, next) {
  if (CONFIG.environment === 'test') {
    return next();
  }

  // If there's no container set we're probably in an invalid Branch or in the
  // InstallationManager, so we shouldn't execute this middleware.
  if (req.container == null) {
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
