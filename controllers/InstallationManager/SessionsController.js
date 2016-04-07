var path = require('path');
var passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationManagerStrategy.js'));
passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationManagerTokenStrategy.js'))(passport);
var urlFor = CONFIG.router.helpers;

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

      return res.status(200).end();
    },

    resetUpdate: function (req, res, next) {
      if (req.user) {
        return res.status(403).end();
      }

      return res.status(200).end();
    }

  }
});

module.exports = new InstallationManager.SessionsController();
