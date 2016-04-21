var path = require('path');
var urlFor = CONFIG.router.helpers;
var _ = require('lodash');
var Promise = require('bluebird');

var templates = {
  sendActivationLink: path.join(process.cwd(), 'views', 'mailers', 'User', 'activationLink.html'),
  sendChangedPasswordNotification: path.join(process.cwd(), 'views', 'mailers', 'User', 'changedPasswordNotification.html'),
  sendChangedEmail: path.join(process.cwd(), 'views', 'mailers', 'User', 'changedEmailNotification.html'),
  sendResetPassword: path.join(process.cwd(), 'views', 'mailers', 'User', 'resetPassword.html'),
};

var UserMailer = Class('UserMailer').inherits(BaseMailer)({

  prototype: {

    installationUrl: null,

    init: function (config) {
      Object.keys(config || {}).forEach(function (propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      var that = this;

      if (!this.installationUrl) {
        throw new Error('installationUrl is a required field');
      }
    },

    sendChangedPasswordNotification: function (user) {
      var templateOptions = {
        user: user
      };

      var options = {
        from: 'from@patos.net',
        to: user.email,
        subject: 'PatOS: Your password was changed.',
        html: this._compileTemplate(templates.sendChangedPasswordNotification, templateOptions)
      };

      return this._send(options);
    },

    sendChangedEmailEmails: function (user) {
      var that = this;

      var templateOptions = {
        user: user
      };

      var options = {
        from: 'from@patos.net',
        to: user._oldEmail,
        subject: 'PatOS: Your email was changed.',
        html: this._compileTemplate(templates.sendChangedEmail, templateOptions)
      };

      return this
        ._send(options)
        .then(function () {
          return that.sendActivationLink(user);
        })
    },

    sendActivationLink: function (user) {
      var templateOptions = {
        user: user,
        helpers : {
          urlFor : urlFor
        },
        installationUrl: this.installationUrl,
      };

      var options = {
        from: 'from@patos.net',
        to: user.email,
        subject: 'PatOS: Activate your account.',
        html: this._compileTemplate(templates.sendActivationLink, templateOptions)
      };

      return this._send(options);
    },

    sendResetPassword: function (user, token) {
      var templateOptions = {
        helpers: {
          urlFor: urlFor
        },
        installationUrl: this.installationUrl,
        user: user,
        token: token
      };

      var options = {
        from: 'from@patos.net',
        to: user.email,
        subject: 'PatOS: Reset password.',
        html: this._compileTemplate(templates.sendResetPassword, templateOptions)
      };

      return this._send(options);
    },

  },

});

module.exports = UserMailer;
