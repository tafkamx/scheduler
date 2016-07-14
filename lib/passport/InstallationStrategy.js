var bcrypt = require('bcrypt-node');
var passport = require('passport');
var InstallationStrategy = require('passport-local').Strategy;

passport.use('Installation', new InstallationStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, function(req, email, password, done) {
  req.container.query('User').include('account').where({
    email : email
  }).then(function(result) {
    if (result.length === 0) {
      return done(new Error('User not found'));
    }

    if (result[0].token) {
      return done(new Error('User not activated'));
    }

    bcrypt.compare(password, result[0].encryptedPassword, function(err, valid) {
      if (err) {
        return done(err);
      }

      if (!valid) {
        return done(new Error('Wrong password'));
      }

      if (!req.branchId) {
        return req.container.query('InstallationSettings').where({
          franchisor_id : result[0].id
        }).then(function(installationSettings) {

          if (installationSettings.length === 0) {
            return done(new Error('Can\'t find a Master Account'));
          } else {
            req.session.role = 'Franchisor';
            return done(null, result[0]);
          }
        });
      } else {
        if (req.branchId !== result[0].account.branchId ) {
          return done(new Error('Can\'t find the user in the current branch'));
        } else {
          req.session.role = result[0].account.type;
          return done(null, result[0]);
        }
      }
    });
  }).catch(done);
}));

module.exports = passport;
