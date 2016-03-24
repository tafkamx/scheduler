var path = require('path');
var urlFor = CONFIG.router.helpers;

InstallationManager.HomeController = Class(InstallationManager, 'HomeController').inherits(BaseController)({

  beforeActions: [
    {
      before: ['_authenticate'],
      actions: ['index']
    }
  ],

  prototype: {
    _authenticate: function (req, res, next) {
      if (!req.user) {
        neonode.app.emit('destroyKnex', req);
        return res.redirect(urlFor.installationManagerLogin());
      }

      next();
    },

    index: function (req, res, next) {
      neonode.app.emit('destroyKnex', req);
      res.render('InstallationManager/Home/index.html');
    }
  }

});

module.exports = new InstallationManager.HomeController();
