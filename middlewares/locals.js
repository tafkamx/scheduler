// Use this middleware to set res.locals variables

module.exports = function(req, res, next) {
  if (CONFIG[CONFIG.environment].sessions !== false && CONFIG.environment !== 'test') {
    res.locals.csrfToken = req.csrfToken();
  }

  req.role = 'Visitor';

  if (req.user) {
    req.role = 'Admin';
  }

  next();
}
