var path = require('path');

var HomeController = Class('HomeController').inherits(BaseController)({

  beforeActions: [
    {
      before: ['_authenticate'],
      actions: ['index']
    }
  ],

  prototype : {
    _authenticate : function(req, res, next) {
      if (!req.user) {
        return res.redirect(CONFIG.router.helpers.login.url());
      }

      next();
    },

    index: function(req, res, next) {
      res.render('home/index.html');
    }
  }
});

module.exports = new HomeController();
