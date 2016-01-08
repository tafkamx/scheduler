if (CONFIG[CONFIG.environment].sessions !== false && CONFIG.environment !== 'test') {
  module.exports = require('csurf')();
} else {
  module.exports = function(req, res, next) {
    next();
  }
}
