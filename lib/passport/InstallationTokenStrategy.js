module.exports = function(passport) {
  var TokenStrategy = require('passport-token').Strategy;

  passport.use('InstallationTokenStrategy', new TokenStrategy({
    usernameQuery: 'email',
    tokenQuery:     'token',
    passReqToCallback: true
  }, function (request, username, token, done) {
    request.container.query('User')
      .where({
        token : token
      })
      .then(function(result) {
        if (!result || result.length === [0]) {
          return done(new Error('Invalid token'));
        }

        return done(null, result[0]);
      }).catch(done);
  }));

  return passport;
}
