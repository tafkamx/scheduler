var bcrypt = require('bcrypt-node');
var passport = require('passport');
var InstallationStrategy = require('passport-local').Strategy;

passport.use('Installation', new InstallationStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, function(request, email, password, done) {
  M.User.query(request.knex).where({
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

      return done(null, result[0]);
    });
  }).catch(done);
}));

module.exports = passport;
