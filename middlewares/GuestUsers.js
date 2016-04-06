var path = require('path');

var manager = function(req, res, next) {
  var getVars = require('url').parse(req.url, true).query;
  if(!getVars['guest_login_token']) return next();

  var loginTokenize = require(path.join(process.cwd(), 'lib', 'utils', 'login-tokenize.js'));
  var userData = loginTokenize.attemptVerifyToken(getVars['guest_login_token']);

  if(!userData) {
    console.log('Failed to verify Guest Login Token. Possible attack? ' + "\n\n" + getVars.guest_login_token);
    return next();
  }

  console.log('Successfully logged in guest user. User Data: ' + userData);
  next();
};

module.exports = manager;
