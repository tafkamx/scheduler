var bcrypt = require('bcrypt-node');
var passport = require('passport');
var InstallationManagerStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(req, id, done) {
  var query;

  if (req.knex) {
    query = User.query(req.knex);
  } else {
    query = InstallationManager.User.query();
  }

  query.where({id : id}).then(function(result) {
    done(null, result[0]);
  }).catch(done);
});

passport.use('InstallationManager', new InstallationManagerStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, function(request, email, password, done) {
  InstallationManager.User.query().where({
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
  });
}));

module.exports = passport;
