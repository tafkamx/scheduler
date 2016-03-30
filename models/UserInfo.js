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

    role: [
      'required',
      'maxLength:255',
      {
        rule: function (val) {
          if (val.match(/(admin|staff|teacher|student)/) === null) {
            throw new Error('role must be one of admin, staff, teacher or student.');
          }
        },
        message: 'role must be one of admin, staff, teacher or student.'
      }
    ]
  },

  attributes: [
    'id',
    'userId',
    'role',
    'createdAt',
    'updatedAt'
  ],

  prototype: {
    role: null
  }
});

module.exports = UserInfo;
