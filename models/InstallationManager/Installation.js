var Knex = require('knex');
var psl = require('psl');
var path = require('path');
var Promise = require('bluebird');

Class(InstallationManager, 'Installation').inherits(InstallationManager.InstallationManagerModel).includes(CustomEvent, CustomEventSupport)({
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

  migrateAll : function () {
    return this.query().then(function(result) {
      return Promise.each(result, function(installation) {
        return installation.migrate();
      });
    });
  },

  prototype : {
    id : null,
    name : null,
    domain : null,

    init : function(config) {
      InstallationManager.InstallationManagerModel.prototype.init.call(this, config);

      var model = this;

      this.on('afterCreate', function(done) {
        model.createDatabase().then(function() {
          return model.migrate()
        }).then(function() {
          done();
        }).catch(done)
      });

      return this;
    },

    createDatabase : function () {
      var conf = require(path.join(process.cwd(), 'knexfile.js'));

      var name = [this.name, CONFIG.environment].join('-');

      var knex = new Knex(conf[CONFIG.environment]);

      logger.info('Creating ' + name + ' database');

      return knex.raw('CREATE DATABASE "' + name + '";').then(function() {
        return knex.destroy();
      });
    },

    migrate : function () {
      var conf = require(path.join(process.cwd(), 'knexfile.js'));

      var name = [this.name, CONFIG.environment].join('-');

      conf[CONFIG.environment].connection.database = name;

      var knex = new Knex(conf[CONFIG.environment]);

      logger.info('Migrating ' + name + ' database');

      return knex.migrate.latest().then(function() {
        return knex.destroy();
      });
    }
  }
});

module.exports = InstallationManager.Installation;
