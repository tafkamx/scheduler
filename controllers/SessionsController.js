var path = require('path');
var passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationStrategy.js'));
passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationTokenStrategy.js'))(passport);
var moment = require('moment');

var urlFor = CONFIG.router.helpers;

var SessionsController = Class('SessionsController').inherits(BaseController)({
  prototype : {
    new : function(req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect('/');
      }

      if (!req.query.token) {
        return res.render('sessions/new.html',  { urlFor : urlFor });
      }

      passport.authenticate('InstallationTokenStrategy', function(err, user, info) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect(urlFor.login());
        }

        if (!user) {
          req.flash('error', 'Invalid email or password!');
          return res.redirect(urlFor.login());
        }

        user.token = null;

        user.save(req.knex).then(function() {
          req.login(user, function(err) {
            if (err) {
              logger.error('Error', err);
              return next(err);
            }

            req.flash('success', 'Welcome to PatOS Installation');
            return res.redirect(urlFor.root());
          });
        }).catch(next);

      })(req, res, next);

    },

    create : function(req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect(urlFor.root());
      }

      passport.authenticate('Installation', function(err, user, info) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect(urlFor.login());
        }

        req.login(user, function(err) {
          if (err) {
            logger.error('Error', err);
            return next(err);
          }

          req.flash('success', 'Welcome to PatOS Installation');
          return res.redirect(urlFor.root());
        });
      })(req, res, next);
    },

    destroy : function(req, res, next) {
      req.logout();
      req.flash('success', 'Signed off');

      res.clearCookie('guest-user-access-' + req.branch + '-' + req.installationId)// Logs off Guest Users, too.
      return res.redirect(urlFor.login());
    },

    resetShow: function (req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect(urlFor.root());
      }

      return res.render('sessions/reset.html');
    },

    resetCreate: function (req, res, next) {
      if (req.user) {
        return res.status(403).end();
      }

      Promise.resolve()
        .then(function () {
          return User.query(req.knex)
            .where('email', req.body.email);
        })
        .then(function (result) {
          // NOTE: This can very easily be exploited in a brute force attack, to find emails.
          if (result.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
          }

          var token = new ResetPasswordToken({
            userId: result[0].id
          });

          return token.save(req.knex);
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
          return ResetPasswordToken.query(req.knex)
            .where('token', req.body.token)
            .include('user');
        })
        .then(function (result) {
          if (result.length === 0) {
            return res.status(404).json({ message: 'Invalid token' });
          }

          token = result[0];

          // Invalidate so it can't be used again
          return token.invalidate().save(req.knex);
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

          return token.user.save(req.knex);
        })
        .then(function () {
          return res.status(200).json({ message: 'Password has been reset' });
        })
        .catch(next);
    }

  }
});

module.exports = new SessionsController();
