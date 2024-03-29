'use strict';

var path = require('path');
var bcrypt = require('bcrypt-node');
var moment = require('moment');

Class(M, 'ResetPasswordToken').inherits(DynamicModel)({
  tableName: 'ResetPasswordTokens',

  validations: {
    userId: [
      'required',
      'uuid'
    ],

    token: [
      'maxLength:512',
    ],

    expiresAt: [
      'required'
    ]
  },

  attributes: [
    'id',
    'userId',
    'token',
    'expiresAt',
    'createdAt',
    'updatedAt'
  ],

  prototype: {

    init: function (config) {
      DynamicModel.prototype.init.call(this, config);

      var model = this;

      // Add expiration date
      this.on('beforeValidation', function (next) {
        if (!model.expiresAt) {
          model.expiresAt = moment().add(1, 'hours');
        }

        next();
      });

      // Add token for confirmation
      this.on('beforeCreate', function (next) {
        model.token = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null);

        next();
      });

      // Mailers

      // Send reset password email
      this.on('afterCreate', function (next) {
        model._container.query('User')
          .where('id', model.userId)
          .then(function (res) {
            return model._modelExtras.mailers.user.sendResetPassword(res[0], model);
          })
          .then(function () {
            return next();
          })
          .catch(next);
      });
    },

    invalidate: function () {
      this.token = null;

      return this;
    }

  }
});

module.exports = M.ResetPasswordToken;
