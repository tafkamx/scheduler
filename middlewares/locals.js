// Use this middleware to set res.locals variables

var urlFor = require(path.join(process.cwd(), 'config', 'routeMapper.js')).helpers;
var _ = require('lodash');

module.exports = function(req, res, next) {
  if (CONFIG[CONFIG.environment].sessions !== false && CONFIG.environment !== 'test') {
    res.locals.csrfToken = req.csrfToken();
  }

  req.role = 'Visitor';

  if (req.user) {
    req.role = 'Admin';
  }

  var helpers = {
    urlFor : urlFor
  };

  _.assign(res.locals.helpers, helpers);

  next();
}
