// Use this middleware to set res.locals variables

var path = require('path');
var urlFor = CONFIG.router.helpers;
var _ = require('lodash');

module.exports = function(req, res, next) {
  return Promise.resolve()
    .then(function () {
      if (CONFIG[CONFIG.environment].sessions !== false && CONFIG.environment !== 'test') {
        res.locals.csrfToken = req.csrfToken();
      } else {
        res.locals.csrfToken = '';
      }
    })
    .then(function () {
      var role = 'Visitor';

      if (!req.user) {
        req.role = 'Visitor';
        return;
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
        });
    })
    .then(function () {
      if (_.isUndefined(res.locals.helpers)) {
        res.locals.helpers = {};
      }

      var helpers = {
        urlFor: urlFor
      };

      _.assign(res.locals.helpers, helpers);
    })
    .then(function() {
      console.log(req.user);
    })
    .then(next)
    .catch(next);
}
