'use strict';

var Branch = Class('Branch').inherits(DynamicModel)({
  tableName: 'Branches',

  validations: {
    name: [
      {
        rule: function (val) {
          var regExp = /^[a-zA-Z0-9\-]+$/;

          if (!regExp.test(val)) {
            throw new Error('name must only contain alpha-numeric characters and dashes.');
          }
        },
        message: 'name must only contain alpha-numeric characters and dashes.'
      },
      {
        rule: function(val) {
          var query = Branch.query(this.target._knex)
            .where('name', val);

          if (this.target.id) {
            query.andWhere('id', '!=', this.target.id);
          }

          return query
            .then(function(result) {
              if (result.length > 0) {
                throw new Error('The name already exists.');
              }
            });
        },
        message: 'The name already exists.'
      },
      'required',
      'maxLength:255'
    ]
  },

  attributes: [
    'id',
    'name',
    'createdAt',
    'updatedAt'
  ],

  relations: {},

  prototype: {}
});

module.exports = Branch;
