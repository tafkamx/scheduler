var path = require('path');
var urlFor = CONFIG.router.helpers;
var bcrypt = require('bcrypt-node');
var DomainContainer = require('domain-container');

Class(InstallationManager, 'InstallationsController').inherits(BaseController)({

  beforeActions: [
    {
      before: [neonode.controllers['InstallationManager.Home']._authenticate],
      actions: ['index', 'show', 'new', 'create', 'edit', 'update', 'destroy']
    },
    {
      before: ['_loadInstallation'],
      actions: ['show', 'edit', 'update', 'destroy']
    },
    {
      before : ['_loadInstallationSettings'],
      actions : ['show', 'edit']
    },
    {
      before : ['_loadTimezones'],
      actions : ['new', 'edit']
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

          res.locals.installation = result[0];

          return next();
        }).catch(next);
    },

    _loadInstallationSettings : function(req, res, next) {
      var dynKnex = res.locals.installation.getDatabase();

      InstallationSettings.query(dynKnex).then(function(settings) {
        if (settings.length === 0) {
          settings[0] = {};
        }

        res.locals.installationSettings = settings[0];
        return dynKnex.destroy();
      }).then(function() {
        next();
      }).catch(next);
    },

    _loadTimezones : function(req, res, next) {
      var knex = InstallationManager.Installation.knex();

      knex('pg_timezone_names').then(function(result) {
        res.locals.timezones = result;

        next();
      }).catch(next);
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
          res.json(res.locals.installation);
        }
      });
    },

    new: function(req, res, next) {
      return res.format({
        html: function () {
          res.render('InstallationManager/Installations/new.html');
        }
      });
    },

    create: function (req, res, next) {
      var installationForm = {
          name: req.body.name,
          domain: req.body.domain
        },
        franchisorForm = {
          email: req.body.franchisorEmail
        };

      res.format({
        json: function () {
          var installation = new InstallationManager.Installation(installationForm);

          installation
            .save()
            .then(function () {
              var container = new DomainContainer({
                knex: installation.getDatabase(),
                models: M,
                modelExtras: {
                  mailers: {
                    user: new UserMailer({
                      baseUrl: res.locals.helpers.generateInstallationUrl('default', installation.name),
                    }),
                  },
                },
              });

              return container
                .create('User', {
                  email: franchisorForm.email,
                  role: 'franchisor',
                  password: bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null).slice(0, 11)
                })
                .then(function () {
                  return container.create('InstallationSettings', req.body.installationSettings);
                })
                .then(function () {
                  return container.cleanup();
                });
            })
            .then(function() {
              return installationKnex.destroy();
            })
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
          res.json(res.locals.installation);
        }
      });
    },

    update: function (req, res, next) {
      res.format({
        json: function() {
          res.locals.installation
            .updateAttributes(req.body)
            .save()
            .then(function() {
              if (!req.body.installationSettings) {
                return;
              }

              var installation = res.locals.installation;
              var installationKnex = installation.getDatabase();

              return InstallationSettings.query(installationKnex).then(function(settings) {
                settings[0].updateAttributes(req.body.installationSettings);

                return settings[0].save(installationKnex).then(function() {
                  return installationKnex.destroy();
                });
              });
            })
            .then(function() {
              res.json(res.locals.installation);
            })
            .catch(next);
        }
      });
    },

    destroy: function (req, res, next) {
      res.format({
        json: function () {
          res.locals.installation
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
