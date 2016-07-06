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

    _getUserBranch: function(user) {
      var container = user.constructor._container;

      if (!container) {
        throw new Error('Can\'t access user container');
      }

      return container.query('Account').where({
        user_id : user.id
      })
      .then(function(account) {
        if (account.length === 0) {
          return false;
        }

        return container.query('Branch').where({
          id : account[0].branchId
        })
        .then(function(branch) {
          if (branch.length === 0) {
            return false;
          }

          return branch[0];
        });
      })
      .then(function(branch) {
        if (branch ==== false) {
          return false;
        }

        return branch.name;
      });
    }

  },
});

module.exports = UserMailer;
