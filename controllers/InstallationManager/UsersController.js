var path = require('path');
var bcrypt = require('bcrypt-node');

InstallationManager.UsersController = Class(InstallationManager, 'UsersController').inherits(BaseController)({

  beforeActions : [
    {
      before: [neonode.controllers['InstallationManager.Home']._authenticate],
      actions: ['index', 'show', 'new', 'create', 'edit', 'update', 'destroy', 'checkPassword']
    },
    {
      before : ['_loadUser'],
      actions : ['show', 'edit', 'update', 'destroy', 'checkPassword']
    }
  ],

  prototype : {
    _loadUser : function(req, res, next) {
      InstallationManager.User.query()
        .where('id', req.params.id)
        .then(function(result) {
          var id = req.params.id || req.params.userId;

          if (result.length === 0) {
            throw new NotFoundError('User ' + id + ' not found');
          }

          res.locals.adminUser = result[0];
          req.adminUser = result[0];

          delete res.locals.adminUser.encryptedPassword;
          delete res.locals.adminUser.token;

          next();
        })
        .catch(next);
    },

    index : function (req, res, next) {
      InstallationManager.User.query()
        .then(function(results) {
          results.forEach(function(result) {
            delete result.encryptedPassword;
            delete result.token;
          });

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
              delete adminUser.encryptedPassword;
              delete adminUser.token;
              delete adminUser.password;

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
          req.adminUser
            .updateAttributes(req.body)
            .save()
            .then(function(val) {
              res.locals.adminUser = new InstallationManager.User(req.adminUser);

              delete res.locals.adminUser.encryptedPassword;
              delete res.locals.adminUser.token;
              delete res.locals.adminUser.password;

              res.json(res.locals.adminUser);
            })
            .catch(next);
        }
      });
    },

    destroy : function (req, res, next) {
      res.format({
        json : function() {
          req.adminUser
            .destroy()
            .then(function() {
              res.json({ deleted: true });
            })
            .catch(next);
        }
      });
    },

    /*
     * POST /InstallationManager/Users/:userId/checkPassword
     * -> {
     *   password: <String>
     * }
     * <- {
     *   isValid: <Boolean>
     * }
     */
    checkPassword: function (req, res, next) {
      res.format({
        json: function () {
          bcrypt.compare(req.body.password, req.adminUser.encryptedPassword, function (err, isValid) {
            if (err) { return next(err); }

            return res.json({
              isValid: isValid
            });
          });
        }
      });
    }
  }
});

module.exports = new InstallationManager.UsersController();
