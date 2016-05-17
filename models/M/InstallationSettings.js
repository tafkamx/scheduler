Class(M, 'InstallationSettings').inherits(DynamicModel)({
  tableName : 'InstallationSettings',
  LANGUAGES : {
    'en-CA' : 'Canadian English',
    'en-US' : 'English'
  },
  CURRENCIES : {
    'USD' : {
      symbol : '$'
    },
    'CAD' : {
      symbol : '$'
    }
  },

  validations : {
    language : [
      'required',
      {
        rule : function(val) {
          if (!M.InstallationSettings.LANGUAGES[val]) {
            throw new Error('Language is invalid.');
          }
        },
        message : 'Language is invalid.'
      }
    ],
    currency : [
      'required',
      {
        rule : function(val) {
          if (!M.InstallationSettings.CURRENCIES[val]) {
            throw new Error('Currency is invalid.')
          }
        },
        message : 'Currency is invalid.'
      }
    ],
    timezone : [
      'required',
      {
        rule : function(val) {
          var knex = this.target._knex;

          return knex('pg_timezone_names').select('name').where('name', val).then(function(result) {
            if (result.length === 0) {
              throw new Error('Timezone is invalid.')
            }
          });
        },
        message : 'Timezone is invalid.'
      }
    ],

    franchisorId: [
      'required',
      'uuid',
      {
        rule: function (val) {
          var that = this.target;

          var query = that._container.query('User')
            .where('id', val);

          return query
            .then(function (result) {
              if (result.length === 0) {
                throw new Error('The franchisorId does not exist.');
              }
            });
        },
        message: 'The franchisorId does not exist.'
      }
    ],
  },
  attributes : [
    'id',
    'language',
    'currency',
    'timezone',
    'createdAt',
    'updatedAt',
    'franchisorId',
  ],

  prototype : {

    language : null,
    currency : null,
    timezone : null,

    init : function(config) {
      DynamicModel.prototype.init.call(this, config);

      var model = this;

      this.on('beforeSave', function(done) {
        model.constructor.query(model._knex).delete().then(function() {
          return done();
        }).catch(done);
      });

      return this;
    }
  }
});

module.exports = M.InstallationSettings;
