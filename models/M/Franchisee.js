'use strict';

Class(M, 'Franchisee').inherits(Krypton.Model)({
  tableName: 'Franchisees',

  validations: {
    id: ['natural'],
    accountId: [
      'uuid',
      'required',
    ],
  },

  attributes: [
    'id',
    'accountId',
    'createdAt',
    'updatedAt',
  ],
});
