var path = require('path');
var urlFor = require(path.join(process.cwd(), 'config', 'routeMapper.js')).helpers;

InstallationManager.UsersController = Class(InstallationManager, 'UsersController').inherits(BaseController)({

  beforeActions : [
    {
      before : [neonode.controllers.Home._authenticate],
      actions : ['index', 'show', 'create', 'edit', 'update', 'destroy']

    },
    {
      before : ['_loadUser'],
      actions : ['show', 'edit', 'update', 'destroy']
    }
  ],

  prototype : {
    _loadUser : function(req, res, next) {
      InstallationManager.User.query().where({id : req.params.id}).then(function(result) {

        if (result.length === 0) {
          throw new NotFoundError('User ' + req.params.id + ' not found');
        }

        res.locals.adminUser = result[0];
        req.adminUser = result[0];

        next();
      }).catch(function(err) {
        next(err)
      });
    },

    index : function index(req, res, next) {
      InstallationManager.User.query().then(function(results) {
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
      }).catch(next);
    },

    show : function show(req, res, next) {
      delete res.locals.adminUser.encryptedPassword;
      delete res.locals.adminUser.token;

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

    create : function create(req, res, next) {
      res.format({
        json : function() {
          var adminUser = new InstallationManager.User(req.body);

          adminUser.save().then(function() {
            delete adminUser.encryptedPassword;
            delete adminUser.token;

            res.json(adminUser);
          }).catch(next);
        }
      });
    },

    edit : function edit(req, res, next) {
      delete res.locals.adminUser.encryptedPassword;
      delete res.locals.adminUser.token;

      res.format({
        html : function() {
          res.render('InstallationManager/Users/edit.html');
        },
        json : function() {
          res.json(res.locals.adminUser);
        }
      });
    },

    update : function update(req, res, next) {
      res.format({
        json : function() {
          res.locals.adminUser.updateAttributes(req.body).save().then(function(val) {
            delete res.locals.adminUser.encryptedPassword;
            delete res.locals.adminUser.token;

            res.json(res.locals.adminUser);
          }).catch(next);
        }
      });
    },

    destroy : function destroy(req, res, next) {
      res.format({
        json : function() {
          req.adminUser.destroy().then(function() {
            res.json({deleted: true});
          }).catch(next);
        }
      });
    }
  }
});

module.exports = new InstallationManager.UsersController();
