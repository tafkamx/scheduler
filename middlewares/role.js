'use strict';

module.exports = function (req, res, next) {
  var role = 'Visitor';

  if (!req.user) {
    req.role = 'Visitor';
    return next();
  }

  return Promise.resolve()
    .then(function () {
      if (req.url.match(/^(\/InstallationManager)/) !== null) {
        role = 'Admin';
      }
    })
    .then(function () {
      if (role === 'Admin') {
        return;
      }

      var userRole = req.user.info.role;

      role = userRole[0].toUpperCase() + userRole.slice(1).toLowerCase();
    })
    .then(function () {
      req.role = role;
    })
    .then(next)
    .catch(next);
};
