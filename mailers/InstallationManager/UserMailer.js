var path = require('path');
var urlFor = CONFIG.router.helpers;
var _ = require('lodash');

var base = path.join(process.cwd(), 'views', 'mailers', 'InstallationManager', 'UserMailer');

var templates = {
  sendActivationLink: path.join(base, 'activationLink.html'),
  sendChangedPasswordNotification: path.join(base, 'changedPasswordNotification.html'),
  sendChangedEmail: path.join(base, 'changedEmailNotification.html'),
  sendResetPassword: path.join(base, 'resetPassword.html'),
};

Class(InstallationManager, 'UserMailer').inherits(BaseMailer)({
  prototype: {

    baseUrl: null,

    init: function (config) {
      var that = this;

      BaseMailer.prototype.init.call(that);

      that.baseUrl = config.baseUrl || CONFIG.env().defaultDomainName;
    },


    sendActivationLink: function (user) {
      var templateOptions = {
        user: user,
        helpers : {
          urlFor : urlFor
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
          return UserMailer.sendActivationLink(user);
        })
    },

    sendResetPassword: function (user, token) {
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

module.exports = InstallationManager.UserMailer;
