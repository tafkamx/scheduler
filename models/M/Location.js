'use strict';

Class(M, 'Location').inherits(DynamicModel)({

  tableName: 'Locations',

  validations: {
    name: [
      'required',
      'maxLength:255',
    ],

    address1: [
      'required',
      'maxLength:255',
    ],

    address2: [
      'required',
      'maxLength:255',
    ],

    city: [
      'required',
      'maxLength:255',
    ],

    state: [
      'required',
      'maxLength:255',
    ],

    country: [
      'required',
      'maxLength:255',
    ],

    postalCode: [
      'required',
      'maxLength:255',
    ],

    latitude: [
      'required',
      'maxLength:255',
    ],

    longitude: [
      'required',
      'maxLength:255',
    ],
  },

  attributes: [
    'id',
    'name',
    'address1',
    'address2',
    'city',
    'state',
    'country',
    'postalCode',
    'latitude',
    'longitude',
    'createdAt',
    'updatedAt',
  ],

});

module.exports = M.Location;
