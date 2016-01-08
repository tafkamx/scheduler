var path = require('path');
var urlFor = require(path.join(process.cwd(), 'config', 'routeMapper.js')).helpers;

InstallationAdmin.AdminUsersController = Class(InstallationAdmin, 'AdminUsersController').inherits(BaseController)({

  beforeActions : [
    {
      before : [neonode.controllers.Home._authenticate],
      actions : ['index', 'show', 'create', 'edit', 'update', 'destroy']

    },
    {
      before : ['_loadAdminUser'],
      actions : ['show', 'edit', 'update', 'destroy']
    }
  ],

  prototype : {
    _loadAdminUser : function(req, res, next) {
      AdminUser.query().where({id : req.params.id}).then(function(result) {

        if (result.length === 0) {
          throw new NotFoundError('AdminUser ' + req.params.id + ' not found');
        }

        res.locals.adminUser = result[0];
        req.adminUser = result[0];
        next();
      }).catch(function(err) {
        next(err)
      });
    },

    index : function index(req, res, next) {
      AdminUser.query().then(function(results) {
        results.forEach(function(result) {
          delete result.encryptedPassword;
          delete result.token;
        });

        res.locals.adminUsers = results;

        res.format({
          html : function() {
            res.render('InstallationAdmin/AdminUsers/index.html');
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
          res.render('InstallationAdmin/AdminUsers/show.html');
        },
        json : function() {
          res.json(res.locals.adminUser);
        }
      });
    },

    new : function(req, res, next) {
      res.render('InstallationAdmin/AdminUsers/new.html');
    },

    create : function create(req, res, next) {
      res.format({
        json : function() {
          var adminUser = new AdminUser(req.body);

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
          res.render('InstallationAdmin/AdminUsers/edit.html');
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
          res.locals.adminUser.destroy().then(function() {
            res.json({deleted: true});
          }).catch(next);
        }
      });
    }
  }
});

module.exports = new InstallationAdmin.AdminUsersController();
