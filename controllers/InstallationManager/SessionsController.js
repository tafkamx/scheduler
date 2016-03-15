var path = require('path');
var passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationAdminStrategy.js'));
passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationAdminTokenStrategy.js'))(passport);
var urlFor = require(path.join(process.cwd(), 'config', 'routeMapper.js')).helpers;

InstallationManager.SessionsController = Class(InstallationManager, 'SessionsController').inherits(BaseController)({
  prototype : {
    new : function(req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect('/');
      }

      if (!req.query.token) {
        return res.render('InstallationAdmin/sessions/new.html',  { urlFor : urlFor });
      }

      passport.authenticate('InstallationAdminTokenStrategy', function(err, user, info) {
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

            req.flash('success', 'PatOS Installation Admin.');
            return res.redirect(urlFor.root());
          });
        }).catch(next);

      })(req, res, next);

    },

    create : function(req, res, next) {
      if (req.user) {
        req.flash('info', 'You are already logged in');
        return res.redirect('/');
      }

      passport.authenticate('InstallationAdmin', function(err, user, info) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect(urlFor.installationManagerLogin());
        }

        req.login(user, function(err) {
          if (err) {
            logger.info('Error', err);
            return next(err);
          }

          req.flash('success', 'PatOS Installation Admin.');
          return res.redirect(urlFor.root());
        });
      })(req, res, next);
    },

    destroy : function(req, res, next) {
      req.logout();
      req.flash('success', 'Signed off');
      return res.redirect(urlFor.installationManagerLogin());
    }

  }
});

module.exports = new InstallationManager.SessionsController();
