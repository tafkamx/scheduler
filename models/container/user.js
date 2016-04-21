'use strict';

Module(Container.models, 'User')({
  tableName: 'Users',

  validations: {},

  attributes: [
    'id',
    'email',
    'encryptedPassword',
    'token',
    'createdAt',
    'updatedAt',
  ],

  prototype: {},
});

module.exports = Container.models.User;
