'use strict';

var path = require('path');
var bcrypt = require('bcrypt-node');
var moment = require('moment');

var userMailer = new InstallationManager.UserMailer({});

Class(InstallationManager, 'ResetPasswordToken').inherits(InstallationManager.InstallationManagerModel)({
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
      InstallationManager.InstallationManagerModel.prototype.init.call(this, config);

      var model = this;

      // Add expiration date
      this.on('beforeValidation', function (next) {
        if (!model.expiresAt) {
          model.expiresAt = moment().add(10, 'minutes');
        }

        next();
      });

      // Add token for confirmation
      this.on('beforeCreate', function (next) {
        model.token = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null);

        next();
      });

      // Mailers
      if (CONFIG.environment !== 'test') {
        // Send reset password email
        this.on('afterCreate', function (next) {
          InstallationManager.User.query()
            .where('id', model.userId)
            .then(function (res) {
              return userMailer.sendResetPassword(res[0], model);
            })
            .then(function () {
              return next();
            })
            .catch(next);
        });
      }
    },

    invalidate: function () {
      this.token = null;

      return this;
    }

  }
});
