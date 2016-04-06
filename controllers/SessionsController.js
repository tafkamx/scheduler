var path = require('path');
var passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationStrategy.js'));
passport = require(path.join(process.cwd(), 'lib', 'passport', 'InstallationTokenStrategy.js'))(passport);

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

            req.flash('success', 'Welcome to PatOS Installation.');
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

          req.flash('success', 'Welcome to PatOS Installation.');
          return res.redirect(urlFor.root());
        });
      })(req, res, next);
    },

    destroy : function(req, res, next) {
      req.logout();
      req.flash('success', 'Signed off');

      res.clearCookie('guest-user-access-' + req.branch + '-' + req.installationId)// Logs off Guest Users, too.
      return res.redirect(urlFor.login());
    }

  }
});

module.exports = new SessionsController();
