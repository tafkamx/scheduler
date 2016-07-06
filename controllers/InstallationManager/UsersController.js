/* global Class, InstallationManager, BaseController, neonode, NotFoundError */
var path = require('path');
var RESTFulAPI = require(path.join(process.cwd(), 'lib', 'RESTFulAPI'));

Class(InstallationManager, 'UsersController').inherits(BaseController)({

  beforeActions : [
    {
      before: [neonode.controllers['InstallationManager.Home']._authenticate],
      actions: ['index', 'show', 'new', 'create', 'edit', 'update', 'destroy']
    },
    {
      before : function(req, res, next) {
        RESTFulAPI.createMiddleware({
          queryBuilder : InstallationManager.User.query(),
          filters : {
            allowedFields : ['email']
          }
        })(req, res, next);
      },
      actions : ['index']
    },
    {
      before : ['_loadUser'],
      actions : ['show', 'edit', 'update', 'destroy']
    }
  ],

  prototype : {
    _loadUser : function(req, res, next) {
      InstallationManager.User.query()
        .where('id', req.params.id)
        .then(function(result) {
          if (result.length === 0) {
            throw new NotFoundError('User ' + req.params.id + ' not found');
          }

          res.locals.adminUser = result[0];

          next();
        })
        .catch(next);
    },

    index : function (req, res) {
      res.format({
        html : function() {
          res.render('InstallationManager/Users/index.html', {
            adminUsers: res.locals.results
          });
        },
        json : function() {
          res.json(res.locals.results);
        }
      });
    },

    show : function (req, res) {
      res.format({
        html : function() {
          res.render('InstallationManager/Users/show.html');
        },
        json : function() {
          res.json(res.locals.adminUser);
        }
      });
    },

    new : function(req, res) {
      return res.format({
        html: function () {
          res.render('InstallationManager/Users/new.html');
        }
      });
    },

    create : function (req, res, next) {
      res.format({
        json : function() {
          var adminUser = new InstallationManager.User(req.body);

          adminUser
            .save()
            .then(function() {
              res.json(adminUser);
            })
            .catch(next);
        }
      });
    },

    edit : function (req, res) {
      res.format({
        html : function() {
          res.render('InstallationManager/Users/edit.html');
        },
        json : function() {
          res.json(res.locals.adminUser);
        }
      });
    },

    update : function (req, res, next) {
      res.format({
        json : function() {
          res.locals.adminUser
            .updateAttributes(req.body)
            .save()
            .then(function() {
              res.json(res.locals.adminUser);
            })
            .catch(next);
        }
      });
    },

    destroy : function (req, res, next) {
      res.format({
        json : function() {
          res.locals.adminUser
            .destroy()
            .then(function() {
              res.json({ deleted: true });
            })
            .catch(next);
        }
      });
    }
  }
});

module.exports = new InstallationManager.UsersController();
