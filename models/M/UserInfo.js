'use strict';

Class(M, 'UserInfo').inherits(DynamicModel)({
  tableName: 'UsersInfo',

  validations: {
    userId: [
      'required',
      'uuid',
      {
        rule: function (val) {
          var that = this.target;

          var query = M.UserInfo.query(that._knex)
            .where('user_id', val);

          if (this.target.id) {
            query.andWhere('id', '!=', that.id);
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
          if (val.match(/(franchisor|staff|teacher|student)/) === null) {
            throw new Error('role must be one of franchisor, staff, teacher or student.');
          }
        },
        message: 'role must be one of franchisor, staff, teacher or student.'
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

module.exports = M.UserInfo;
