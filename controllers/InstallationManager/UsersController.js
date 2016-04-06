var path = require('path');

InstallationManager.UsersController = Class(InstallationManager, 'UsersController').inherits(BaseController)({

  beforeActions : [
    {
      before: [neonode.controllers['InstallationManager.Home']._authenticate],
      actions: ['index', 'show', 'new', 'create', 'edit', 'update', 'destroy']
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

    index : function (req, res, next) {
      InstallationManager.User.query()
        .then(function(results) {
          res.locals.adminUsers = results;

          res.format({
            html : function() {
              res.render('InstallationManager/Users/index.html');
            },
            json : function() {
              res.json(results);
            }
          });
        })
        .catch(next);
    },

    show : function (req, res, next) {
      res.format({
        html : function() {
          res.render('InstallationManager/Users/show.html');
        },
        json : function() {
          res.json(res.locals.adminUser);
        }
      });
    },

    new : function(req, res, next) {
      res.render('InstallationManager/Users/new.html');
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

    edit : function (req, res, next) {
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
            .then(function(val) {
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
