var path = require('path');
var urlFor = CONFIG.router.helpers;

var HomeController = Class('HomeController').inherits(BaseController)({
  prototype : {
    _authenticate : function(req, res, next) {
      if (!req.user) {
        return res.redirect(urlFor.InstallationManager.login.url());
      }

      next();
    },

    index: function(req, res, next) {
      res.render('InstallationManager/Home/index.html');
    }
  }
});

module.exports = new HomeController();
