var _ = require('lodash');

Class(M, 'BranchSettings').inherits(DynamicModel)({
  tableName : 'BranchSettings',

  validations : {
    branchId : [
      'required'
    ],
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
          var knex = this.target._container._knex;

          return knex('pg_timezone_names').select('name').where('name', val).then(function(result) {
            if (result.length === 0) {
              throw new Error('Timezone is invalid.')
            }
          });
        },
        message : 'Timezone is invalid.'
      }
    ]
  },
  attributes : [
    'id',
    'branchId',
    'language',
    'currency',
    'timezone',
    'createdAt',
    'updatedAt'
  ],

  prototype : {
    branchId : null,
    language : null,
    currency : null,
    timezone : null,

    init : function(config) {
      DynamicModel.prototype.init.call(this, config);

      return this;
    },

    getInstallationSettings : function(knex) {
      var model = this;

      return M.InstallationSettings.query(knex || this.constructor.knex()).then(function(res) {
        for (var property in res[0]) {
          if (res[0].hasOwnProperty(property)) {
            if (_.includes(['language', 'currency', 'timezone'], property)) {
              model[property] = res[0][property]
            }
          }
        }

        return true;
      });
    }
  }
});

module.exports = M.BranchSettings;
