var Knex = require('knex');
var psl = require('psl');
var path = require('path');
var Promise = require('bluebird');
var DomainContainer = require('domain-container');
var bcrypt = require('bcrypt-node');
var _ = require('lodash');

Class(InstallationManager, 'Installation').inherits(InstallationManager.InstallationManagerModel)({
  tableName : 'Installations',
  validations : {
    name : [
      'required',
      'maxLength:128',
      {
        rule : function(val) {
          var regExp = /^[a-zA-Z0-9\-]+$/;

          if (!regExp.test(val)) {
            throw new Error('name must only contain alpha-numeric characters and dashes.');
          }
        },
        message : 'name must only contain alpha-numeric characters and dashes.'
      },
      {
        rule : function(val) {
          var query = InstallationManager.Installation.query()
            .where('name', val);

          if (this.target.id) {
            query.andWhere('id', '<>', this.target.id);
          }

          return query
            .then(function(result) {
              if (result.length > 0) {
                throw new Error('name already exists.');
              }
            });
        },

        message : 'name already exists.'
      }
    ],
    domain : [
      'maxLength:255',
      {
        rule : function(val) {
          var isValid = psl.isValid(val);

          if (!isValid) {
            throw new Error('Invalid domain.');
          }
        },
        message : 'Invalid domain.'
      },
      {
        rule : function(val) {
          if (val) {
            var query = InstallationManager.Installation.query().where({
              domain : val
            });

            if (this.target.id) {
              query.andWhere('id', '<>', this.target.id);
            }

            return query.then(function(result) {
              if (result.length > 0) {
                throw new Error('domain already exists.');
              }
            })
          }
        }
      }
    ]
  },

  relations : {},

  attributes : ['id', 'name', 'domain', 'createdAt', 'updatedAt'],

  createInstallation: function (config) {
    /*
     * config = {
     *   installation: {},
     *   franchisor: {},
     *   baseUrl: '',
     *   installationSettings: {},
     *   defaultBranchSettings: {},
     * }
     */

    var newInstallation,
      container;

    try {
      config.franchisor.password = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null).slice(0, 11);
      newInstallation = new InstallationManager.Installation(config.installation);
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve()
      .then(function () {
        return newInstallation.save();
      })
      .then(function () {
        container = new DomainContainer({
          knex: newInstallation.getDatabase(),
          models: M,
          modelExtras: {
            mailers: {
              user: new UserMailer({
                baseUrl: config.baseUrl,
              }),
            },
          },
        });
      })
      .then(function () {
        return container.create('User', config.franchisor);
      })
      .then(function (franchisor) {
        config.installationSettings.franchisorId = franchisor.id;

        return container.create('InstallationSettings', config.installationSettings);
      })
      .then(function () {
        return container.create('Branch', { name: 'default' });
      })
      .then(function (branch) {
        if (!config.defaultBranchSettings) {
          config.defaultBranchSettings = _.clone(config.installationSettings);
        }

        config.defaultBranchSettings.branchId = branch.id;

        return container.create('BranchSettings', config.defaultBranchSettings);
      })
      .then(function () {
        return container.cleanup();
      })
      .then(function () {
        return Promise.resolve(newInstallation);
      });
  },

  prototype : {
    id : null,
    name : null,
    domain : null,
    settings : null,

    init : function(config) {
      InstallationManager.InstallationManagerModel.prototype.init.call(this, config);

      var model = this;

      this.on('afterCreate', function(done) {
        model.createDatabase()
        .then(function() {
          done();
        }).catch(done);
      });

      return this;
    },

    createDatabase : function () {
      var model = this;

      var name = [this.name, CONFIG.environment].join('-');

      var knex = model.constructor.knex();

      logger.info('Creating ' + name + ' database');

      // See if we can find a DB by this name, if yes then don't create new DB
      return Promise.resolve()
        .then(function () {
          return knex.raw('SELECT count(*) FROM "pg_catalog"."pg_database" WHERE datname = ?', [name]);
        })
        .then(function (res) {
          var count = +res.rows[0].count;

          if (count > 0) {
            logger.info('Database ' + name + ' already exists');
            return Promise.resolve(true); // skip creating new DB
          } else {
            logger.info('Database ' + name + ' does not yet exist')
            return Promise.resolve(false); // don't skip creating new DB
          }
        })
        .then(function (skip) {
          var prom = Promise.resolve();
          var installKnex;

          if (skip) {
            installKnex = model.getDatabase();

            // migrate, just in case but don't create DB
            return prom
              .then(function () {
                return model.migrate(installKnex);
              })
              .then(function () {
                return installKnex.destroy();
              });
          } else {
            return prom
              .then(function () {
                return knex.raw('CREATE DATABASE "' + name + '";');
              })
              .then(function () {
                installKnex = model.getDatabase();

                return model.migrate(installKnex);
              })
              .then(function () {
                return installKnex.destroy();
              });
          }
        });
    },

    migrate : function (knex) {
      var name = [this.name, CONFIG.environment].join('-');
      logger.info('Migrating ' + name + ' database');

      return knex.migrate.latest();
    },

    getDatabase: function () {
      var conf = require(path.join(process.cwd(), 'knexfile.js'));

      var name = [this.name, CONFIG.environment].join('-');

      conf[CONFIG.environment].connection.database = name;

      var knex = new Knex(conf[CONFIG.environment]);

      return knex;
    }
  }
});

module.exports = InstallationManager.Installation;
