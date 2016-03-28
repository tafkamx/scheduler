'use strict';

var UserInfo = Class('UserInfo').inherits(DynamicModel)({
  tableName: 'UsersInfo',

  validations: {
    userId: [
      'required',
      'uuid',
      {
        rule: function (val) {
          var query = UserInfo.query(this.target._knex)
            .where('user_id', val);

          if (this.target.id) {
            query.andWhere('id', '!=', this.target.id);
          }

          return query
            .then(function (result) {
              if (result.length > 0) {
                throw new Error('The userId already exists.');
              }
            });
        },
        message: 'The userId already exists.'
      }
    ],

    isAdmin: ['required', 'boolean']
  },

  attributes: [
    'id',
    'isAdmin',
    'createdAt',
    'updatedAt'
  ],

  prototype: {
    isAdmin: false
  }
});

module.exports = UserInfo;
