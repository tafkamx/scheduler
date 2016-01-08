var bcrypt = require('bcrypt-node');
var passport = require('passport');
var InstallationAdminStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(req, id, done) {
  var query;

  if (req.knex) {
    query = User.query(req.knex);
  } else {
    query = AdminUser.query();
  }

  query.where({id : id}).then(function(result) {
    done(null, result[0]);
  }).catch(done);
});

passport.use('InstallationAdmin', new InstallationAdminStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, function(request, email, password, done) {
  AdminUser.query().where({
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
