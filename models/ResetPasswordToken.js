'use strict';

var path = require('path');
var bcrypt = require('bcrypt-node');
var UserMailer = require(path.join(process.cwd(), 'mailers', 'UserMailer.js'));
var moment = require('moment');

Class('ResetPasswordToken').inherits(DynamicModel)({
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

      // Send reset password email
      this.on('afterCreate', function (next) {
        User.query(model._knex)
          .where('id', model.userId)
          .then(function (res) {
            return UserMailer.sendResetPassword(res[0], model);
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
