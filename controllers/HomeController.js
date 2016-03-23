var path = require('path');
var urlFor = CONFIG.router.helpers;

var HomeController = Class('HomeController').inherits(BaseController)({
  prototype : {
    _authenticate : function(req, res, next) {
      if (!req.user) {
        neonode.app.emit('destroyKnex', req);
        return res.redirect(urlFor.installationManagerLogin());
      }

      next();
    },

    index: function(req, res, next) {
      neonode.app.emit('destroyKnex', req);
      res.render('InstallationManager/Home/index.html');
    }
  }
});

module.exports = new HomeController();
