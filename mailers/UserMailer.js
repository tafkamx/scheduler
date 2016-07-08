var path = require('path');

var _ = require('lodash');

var base = path.join(process.cwd(), 'views', 'mailers', 'UserMailer');

var templates = {
  sendActivationLink: path.join(base, 'activationLink.html'),
  sendChangedPasswordNotification: path.join(base, 'changedPasswordNotification.html'),
  sendChangedEmail: path.join(base, 'changedEmailNotification.html'),
  sendResetPassword: path.join(base, 'resetPassword.html'),
};

var UserMailer = Class('UserMailer').inherits(BaseMailer)({
  prototype: {

    baseUrl: null,

    init: function (config) {
      var that = this;

      if (_.isUndefined(config.baseUrl)) {
        throw new Error('baseUrl cannot be undefined');
      }

      that.baseUrl = config.baseUrl;
    },

    sendActivationLink: function (user) {
      var that = this;

      var templateOptions = {
        user: user,
        helpers : {
          urlFor : urlFor,
        },
        baseUrl: that.baseUrl,
      };

      var options = {
        from: 'from@patos.net',
        to: user.email,
        subject: 'PatOS: Activate your account.',
        html: this._compileTemplate(templates.sendActivationLink, templateOptions)
      };

      return this._send(options);
    },

    sendChangedPasswordNotification: function (user) {
      var that = this;

      var templateOptions = {
        user: user,
        baseUrl: that.baseUrl,
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
        user: user,
        baseUrl: that.baseUrl,
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

    sendResetPassword: function (user, token) {
      var that = this;

      var templateOptions = {
        helpers: {
          urlFor: urlFor
        },
        user: user,
        token: token,
        baseUrl: that.baseUrl,
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
