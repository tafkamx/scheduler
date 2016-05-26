'use strict';

Class(M, 'Franchisee').inherits(DynamicModel)({
  tableName: 'Franchisees',

  validations: {
    id: ['natural'],
    accountId: [
      'uuid',
      'required',
      {
        rule: function (val) {
          var that = this.target;

          var query = that._container.query('Account')
            .where('id', val);

          return query.then(function (res) {
            if (res.length === 0) {
              throw new Error( 'The accountId does not exist.');
            }
          })
        },
        message: 'The accountId does not exist.',
      }
    ],
  },

  attributes: [
    'id',
    'accountId',
    'createdAt',
    'updatedAt',
  ],

  prototype: {

    init: function (config) {
      DynamicModel.prototype.init.call(this, config);

      var that = this;

      // This model uses incremental integer IDs
      that.on('beforeCreate', function (next) {
        if (typeof that.id !== 'number') {
          delete that.id;
        }

        next();
      });
    },

  },
});
