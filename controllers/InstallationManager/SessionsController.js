var path = require('path');
var passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationManagerStrategy.js'));
passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationManagerTokenStrategy.js'))(passport);
var urlFor = CONFIG.router.helpers;
var moment = require('moment');

Class(InstallationManager, 'SessionsController').inherits(BaseController)({
  prototype : {
    new : function(req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect(urlFor.installationManagerRoot());
      }

      if (!req.query.token) {
        return res.render('InstallationManager/sessions/new.html');
      }

      passport.authenticate('InstallationManagerTokenStrategy', function(err, user, info) {
        if (err) {
          req.flash('error', err.message);

          return res.redirect(urlFor.installationManagerLogin());
        }

        if (!user) {
          req.flash('error', 'Invalid email or password!');
          return res.redirect(urlFor.installationManagerLogin());
        }

        user.token = null;

        user.save().then(function() {
          req.login(user, function(err) {
            if (err) {
              logger.info('Error', err);
              return next(err);
            }

            req.flash('success', 'PatOS Installation Admin');
            return res.redirect(urlFor.installationManagerRoot());
          });
        }).catch(next);

      })(req, res, next);

    },

    create : function(req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect(urlFor.installationManagerRoot());
      }

      passport.authenticate('InstallationManager', function(err, user, info) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect(urlFor.installationManagerLogin());
        }

        req.login(user, function(err) {
          if (err) {
            logger.info('Error', err);
            return next(err);
          }

          req.flash('success', 'PatOS Installation Admin');
          return res.redirect(urlFor.installationManagerRoot());
        });
      })(req, res, next);
    },

    destroy : function(req, res, next) {
      req.logout();
      req.flash('success', 'Signed off');
      return res.redirect(urlFor.installationManagerLogin());
    },

    resetShow: function (req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect(urlFor.installationManagerRoot());
      }

      return res.render('InstallationManager/sessions/reset.html');
    },

    resetCreate: function (req, res, next) {
      if (req.user) {
        return res.status(403).end();
      }

      Promise.resolve()
        .then(function () {
          return InstallationManager.User.query()
            .where('email', req.body.email);
        })
        .then(function (result) {
          // NOTE: This can very easily be exploited in a brute force attack.
          if (result.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
          }

          var token = new InstallationManager.ResetPasswordToken({
            userId: result[0].id
          });

          return token.save();
        })
        .then(function () {
          return res.status(200).json({ message: 'Reset password email sent' });
        })
        .catch(next);
    },

    resetUpdate: function (req, res, next) {
      if (req.user) {
        return res.status(403).end();
      }

      var token;

      Promise.resolve()
        .then(function () {
          return InstallationManager.ResetPasswordToken.query()
            .where('token', req.body.token)
            .include('user');
        })
        .then(function (result) {
          if (result.length === 0) {
            return res.status(404).json({ message: 'Invalid token' });
          }

          token = result[0];

          // Invalidate so it can't be used again
          return token.invalidate().save();
        })
        .then(function () {
          // If the token has expired
          if (moment().isAfter(token.expiresAt)) {
            return res.status(404).json({ message: 'Invalid token' });
          }
        })
        .then(function () {
          // Save new password
          token.user.password = req.body.password;

          return token.user.save();
        })
        .then(function () {
          return res.status(200).json({ message: 'Password has been reset' });
        })
        .catch(next);
    }

  }
});

module.exports = new InstallationManager.SessionsController();
