var path = require('path');

var manager = function(req, res, next) {
  return Promise.resolve()
    .then(function() {
      var getVars = require('url').parse(req.url, true).query;
      if(!getVars['guest_login_token']) return next();

      var loginTokenize = require(path.join(process.cwd(), 'lib', 'utils', 'login-tokenize.js'));
      var userData = loginTokenize.attemptVerifyToken(getVars['guest_login_token'], req.installationName);

      if(!userData) {
        console.log('Failed to verify Guest Login Token. Possible attack? ' + "\n\n" + getVars['guest_login_token']);
        return next();
      }

      req.user = {
        id: 'guest-user',
        email: 'guest@example.com',
        encryptedPassword: 'guest-user',
        info: userData
      };

      console.log('Successfully logged in guest user ' + userData.userId);
      next();
    });
};

module.exports = manager;
