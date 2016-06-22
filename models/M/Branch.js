'use strict';

Class(M, 'Branch').inherits(DynamicModel)({
  tableName: 'Branches',

  validations: {
    name: [
      {
        rule: function (val) {
          var regExp = /^[a-zA-Z0-9\-]+$/;

          if (!regExp.test(val)) {
            throw new Error('The name must only contain alpha-numeric characters and dashes.');
          }
        },
        message: 'The name must only contain alpha-numeric characters and dashes.'
      },
      {
        rule: function(val) {
          var that = this.target;

          var query = that._container.query('Branch')
            .where('name', val);

          if (this.target.id) {
            query.andWhere('id', '!=', that.id);
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

  prototype: {
    init: function (config) {
      DynamicModel.prototype.init.call(this, config);

      var that = this;

      that.on('afterCreate', function (done) {
        if (!that.settings) {
          return done();
        }

        that.settings.branchId = that.id;

        return that._container
          .create('BranchSettings', that.settings)
          .then(function (res) {
            that.settings = res;

            return done();
          })
          .catch(done);
      });
    },
  },
});

module.exports = M.Branch;
