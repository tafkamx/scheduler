var path = require('path');

global.guestSesssions = global.guestSession || {};
var manager = function(req, res, next) {
  req.isGuestUser = false; // So it is possible to determine if a User is a guest User or a true logged-in User.
  var accessSlug = 'guest-user-access-' + req.branch + '-' + req.installationId; // For use in cookies and nonce values

  // This sets the `req.user` object, and the
  var setGuestUser = function(userData) {
    req.isGuestUser = true;

    req.user = {
      id: 'guest-user',
      email: 'guest@example.com',
      encryptedPassword: 'guest-user',
      info: userData,
      guestLastLoad: Date.now() // To keep track of inactivity
    };

    var nonces = require(path.join(process.cwd(), 'lib', 'utils', 'nonces.js'));
    var token = nonces.getUserNonce(req, accessSlug, 1000 * 60 * 60 * 2); // Set nonce for 2 hours
    res.cookie(accessSlug, token, { maxAge: 1000 * 60 * 60, httpOnly: true }); // Using Express
  };

  /**
   * Below checks for the `guest_login_token` GET variable to begin a guest user session,
   * Then checks for guest Cookie previously set
   */
  return Promise.resolve()
    .then(function() { // Get variable
      var getVars = require('url').parse(req.url, true).query;
      if(!getVars['guest_login_token']) return;

      var loginTokenize = require(path.join(process.cwd(), 'lib', 'utils', 'login-tokenize.js'));
      var userData = loginTokenize.attemptVerifyToken(getVars['guest_login_token'], req.installationName);

      if(!userData) { // If userData returns false, token was either generated for a logged-out user, or is just invalid
        logger.info('Failed to verify Guest Login Token. Possible attack? \n Token: ' + getVars['guest_login_token']);
        return;
      }

      // Otherwise, we're instantiating a Guest User instance.
      setGuestUser(userData);
      logger.info('Successfully logged in guest user ' + userData.userId);
    })
    .then(function() { // Cookie checks
      if(req.isGuestUser) return; // If we've already set this User as a guest above, we can stop here.
      if(!req.cookies['guest-user-access-' + req.branch + '-' + req.installationId]) return;
      var nonces = require(path.join(process.cwd(), 'lib', 'utils', 'nonces.js'));

      var userData = nonces.verifyNonce(req.cookies[accessSlug], accessSlug);
      if(userData) setGuestUser(userData);
    })
    .then(next);
};

module.exports = manager;
