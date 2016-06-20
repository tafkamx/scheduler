var path = require('path');

Class(InstallationManager, 'HomeController').inherits(BaseController)({

  beforeActions: [
    {
      before: ['_authenticate'],
      actions: ['index']
    }
  ],

  prototype: {
    _authenticate: function (req, res, next) {
      if (!req.user) {
        return res.format({
          html: function () {
            return res.redirect(urlFor.InstallationManager.login.url());
          },
          json: function () {
            return res.status(403).end();
          }
        });
      }

      next();
    },

    index: function (req, res, next) {
      res.render('InstallationManager/Home/index.html');
    }
  }

});

module.exports = new InstallationManager.HomeController();
