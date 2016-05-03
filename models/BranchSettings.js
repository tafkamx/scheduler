var BranchSettings = Class('BranchSettings').inherits(DynamicModel)({
  tableName : 'BranchSettings',

  validations : {
    branchId : [
      'required'
    ],
    language : [
      'required',
      {
        rule : function(val) {
          if (!InstallationSettings.LANGUAGES[val]) {
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
          if (!InstallationSettings.CURRENCIES[val]) {
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
    }
  }
});

module.exports = BranchSettings;
