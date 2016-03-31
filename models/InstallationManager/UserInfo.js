'use strict';

InstallationManager.UserInfo = Class(InstallationManager, 'UserInfo').inherits(InstallationManager.InstallationManagerModel)({
  tableName: 'UsersInfo',

  validations: {
    userId: [
      'required',
      'uuid',
      {
        rule: function (val) {
          var query = InstallationManager.UserInfo.query(this.target._knex)
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
          if (val.match(/(admin)/) === null) {
            throw new Error('role must be admin.');
          }
        },
        message: 'role must be admin.'
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
    role: 'admin'
  }
});

module.exports = InstallationManager.UserInfo;
