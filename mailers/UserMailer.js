var path = require('path');
var urlFor = CONFIG.router.helpers;
var _ = require('lodash');

var templates = {
  sendActivationLink: path.join(process.cwd(), 'views', 'mailers', 'User', 'activationLink.html'),
  sendChangedPasswordNotification: path.join(process.cwd(), 'views', 'mailers', 'User', 'changedPasswordNotification.html'),
  sendChangedEmail: path.join(process.cwd(), 'views', 'mailers', 'User', 'changedEmailNotification.html'),
  sendResetPassword: path.join(process.cwd(), 'views', 'mailers', 'User', 'resetPassword.html')
};

var UserMailer = Class('UserMailer').inherits(BaseMailer)({
  defaultOptions : {
    mandrillOptions: {
      async: false,
      auto_text: true,
      inline_css: true
    }
  },

  sendActivationLink: function (user) {
    var templateOptions = {
      user: user,
      helpers : {
        urlFor : urlFor
      }
    };

    var options = {
      from: 'from@patos.net',
      to: user.email,
      subject: 'PatOS: Activate your account.',
      html: this._compileTemplate(templates.sendActivationLink, templateOptions)
    };

    _.assign(options, this.defaultOptions);

    return this._send(options);
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

    _.assign(options, this.defaultOptions);

    return this._send(options);
  },

  sendChangedEmailEmails: function (user) {
    var templateOptions = {
      user: user
    };

    var options = {
      from: 'from@patos.net',
      to: user._oldEmail,
      subject: 'PatOS: Your email was changed.',
      html: this._compileTemplate(templates.sendChangedEmail, templateOptions)
    };

    _.assign(options, this.defaultOptions);

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
      token: token
    };

    var options = {
      from: 'from@patos.net',
      to: user.email,
      subject: 'PatOS: Reset password.',
      html: this._compileTemplate(templates.sendResetPassword, templateOptions)
    };

    _.assign(options, this.defaultOptions);

    return this._send(options);
  }

});

module.exports = UserMailer;
