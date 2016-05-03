var path = require('path');
var urlFor = CONFIG.router.helpers;
var bcrypt = require('bcrypt-node');

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
      var dynKnex;

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
      console.log('load settings')
      var dynKnex = res.locals.installation.getDatabase();

      InstallationSettings.query(dynKnex).then(function(settings) {
        if (settings.length === 0) {
          settings[0] = {};
        }

        res.locals.installationSettings = settings[0];
        return next();
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
          domain: req.body.domain,
          settings : req.body.installationSettings
        },
        franchisorForm = {
          email: req.body.franchisorEmail
        };

      res.format({
        json: function () {
          var installation = new InstallationManager.Installation(installationForm),
            installationKnex;

          installation
            .save()
            .then(function () {
              console.log('installation saved...')
              installationKnex = installation.getDatabase();

              var franchisor = new User({
                email: franchisorForm.email,
                role: 'franchisor',
                password: bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null).slice(0, 11)
              });

              return franchisor.save(installationKnex);
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
            .then(function(val) {
              res.json(res.locals.installation);
            })
            .catch(function (err) {
              next(err)
            });
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
