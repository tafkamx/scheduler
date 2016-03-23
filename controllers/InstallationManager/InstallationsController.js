var path = require('path');
var urlFor = CONFIG.router.helpers;

InstallationManager.InstallationsController = Class(InstallationManager, 'InstallationsController').inherits(BaseController)({

  beforeActions : [
    {
      before : [neonode.controllers.Home._authenticate],
      actions : ['index', 'show', 'create', 'edit', 'update', 'destroy']
    },
    {
      before : ['_loadInstallation'],
      actions : ['show', 'edit', 'update', 'destroy']
    }
  ],

  prototype: {
    _loadInstallation: function (req, res, next) {
      InstallationManager.Installation.query()
        .where('id', req.params.id)
        .then(function(result) {
          if (result.length === 0) {
            throw new NotFoundError('Installation ' + req.params.id + ' not found');
          }

          req.installation = result[0];
          res.locals.installation = result[0];

          next();
        })
        .catch(next);
    },

    index: function (req, res, next) {
      InstallationManager.Installation.query()
        .then(function(results) {
          res.locals.installations = results;

          res.format({
            html: function () {
              res.render('InstallationManager/Installations/index.html');
            },
            json: function () {
              res.json(results);
            }
          });
        })
        .catch(next);
    },

    show: function (req, res, next) {
      res.format({
        html: function () {
          res.render('InstallationManager/Installations/show.html');
        },
        json: function () {
          res.json(req.installation);
        }
      });
    },

    new: function(req, res, next) {
      res.render('InstallationManager/Installations/new.html');
    },

    create: function (req, res, next) {
      res.format({
        json: function () {
          var installation = new InstallationManager.Installation(req.body);

          installation
            .save()
            .then(function () {
              res.json(installation);
            })
            .catch(next);
        }
      });
    },

    edit: function (req, res, next) {
      res.format({
        html: function () {
          res.render('InstallationManager/Installations/edit.html');
        },
        json: function () {
          res.json(req.installation);
        }
      });
    },

    update: function (req, res, next) {
      res.format({
        json: function() {
          req.installation
            .updateAttributes(req.body)
            .save()
            .then(function(val) {
              res.json(req.installation);
            })
            .catch(next);
        }
      });
    },

    destroy: function (req, res, next) {
      res.format({
        json: function () {
          req.installation
            .destroy()
            .then(function () {
              res.json({ deleted: true });
            })
            .catch(next);
        }
      });
    }
  }
});

module.exports = new InstallationManager.InstallationsController();
