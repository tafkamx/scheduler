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
    sendActivationLink: function (user) {
      var that = this;

      return user.getHostname().then(hostname => {
        var templateOptions = {
          user: user,
          helpers : {
            urlFor : urlFor,
          },
          hostname: hostname,
        };

        var options = {
          from: 'from@patos.net',
          to: user.email,
          subject: 'PatOS: Activate your account.',
          html: that._compileTemplate(templates.sendActivationLink, templateOptions)
        };

        return that._send(options);
      })


    },

    sendChangedPasswordNotification: function (user) {
      var that = this;

      return user.getHostname().then(hostname => {
        var templateOptions = {
          user: user,
          hostname: hostname,
        };

        var options = {
          from: 'from@patos.net',
          to: user.email,
          subject: 'PatOS: Your password was changed.',
          html: that._compileTemplate(templates.sendChangedPasswordNotification, templateOptions)
        };

        return that._send(options);
      });
    },

    sendChangedEmailEmails: function (user) {
      var that = this;

      return user.getHostname().then(hostname => {
        var templateOptions = {
          user: user,
          hostname: hostname,
        };

        var options = {
          from: 'from@patos.net',
          to: user._oldEmail,
          subject: 'PatOS: Your email was changed.',
          html: that._compileTemplate(templates.sendChangedEmail, templateOptions)
        };

        return that
          ._send(options)
          .then(() => {
            return that.sendActivationLink(user);
          })
      });
    },

    sendResetPassword: function (user, token) {
      var that = this;

      return user.getHostname().then(hostname => {
        var templateOptions = {
          helpers: {
            urlFor: urlFor
          },
          user: user,
          token: token,
          hostname: hostname,
        };

        var options = {
          from: 'from@patos.net',
          to: user.email,
          subject: 'PatOS: Reset password.',
          html: that._compileTemplate(templates.sendResetPassword, templateOptions)
        };

        return that._send(options);
      });
    },
  },
});

module.exports = UserMailer;
