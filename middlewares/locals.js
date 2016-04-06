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
      if (_.isUndefined(res.locals.helpers)) {
        res.locals.helpers = {};
      }

      var helpers = {
        urlFor: urlFor,
        filters: {
          users: require(path.join(process.cwd(), 'public', 'js', 'filters', 'users.js'))
        }
      };

      _.assign(res.locals.helpers, helpers);
    })
    .then(next)
    .catch(next);
}
