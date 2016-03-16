var path = require('path');
var urlFor = require(path.join(process.cwd(), 'config', 'routeMapper.js')).helpers;

var HomeController = Class('HomeController').inherits(BaseController)({
  beforeActions : [
    // {
    //   before : ['_authenticate'],
    //   actions : ['index']
    // }
  ],
  prototype : {
    _authenticate : function(req, res, next) {
      if (!req.user) {
        return res.redirect(urlFor.installationManagerLogin());
      }

      next();
    },

    index : function(req, res, next) {
      res.render('home/index.html', {layout : 'application', posts : ["1", "2", "3", "4", "5"]});
    },

    noLayout : function(req, res) {
      res.render('home/index.html', {layout : false, posts : ["1", "2", "3", "4", "5"]});
    },
  }
});

module.exports = new HomeController();
