var Knex = require('knex');
var psl = require('psl');
var path = require('path');

InstallationManager.Installation = Class(InstallationManager, 'Installation').inherits(InstallationManager.InstallationManagerModel)({
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
          var query = InstallationManager.Installation.query().where({
            name : val
          });

          if (this.target.id) {
            query.andWhere('id', '<>', this.target.id);
          }

          return query.then(function(result) {
            if (result.length > 0) {
              throw new Error('name already exists.');
            }
          });
        },

        message : 'name already exists'
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

  migrateAll : function migrateAll() {
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
        model.createDatabase().then(function(res) {
          return model.migrate();
        }).then(function(result) {
          done();
        }).catch(done);
      });

      return this;
    },

    createDatabase : function () {
      var conf = require(path.join(process.cwd(), 'knexfile.js'));

      var knex = new Knex(conf[CONFIG.environment]);

      return knex.raw('CREATE DATABASE "' + this.name + '-' + CONFIG.environment + '";')
    },

    migrate : function () {
      var conf = require(path.join(process.cwd(), 'knexfile.js'));

      conf[CONFIG.environment].connection.database = this.name + '-' + CONFIG.environment;

      var knex = new Knex(conf[CONFIG.environment]);

      return knex.migrate.latest();
    }
  }
});

module.exports = InstallationManager.Installation;
