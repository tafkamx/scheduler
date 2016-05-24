/**
 * This middleware is for setting the request Account (if applicable) and Role (based on that account).
 */
var Promise = require('bluebird');

module.exports = function(req, res, next) {

  // Let's get the easy stuff out of the way first
  if(!req.user) {
    req.role = 'Visitor'; // Default role is Visitor when there is no Account
    return next();
  } else if(req.url.match(/^(\/InstallationManager)/) !== null) {
    req.role = 'Admin'; // If the User is logged in within the InstallationManager, they are an Administrative User.
    return next();
  }

  Promise.resolve()
    .then(function () {
      return req.container.query('InstallationSettings')
        .where('franchisor_id', req.user.id);
    })
    .then(function (settings) {
      if (settings.length > 0) {
        req.role = 'Franchisor';
      }
    })
    .then(function () {
      if (req.role === 'Franchisor') {
        return;
      }

      // Search for Account related to current Account and Branch
      return req.container.get('Account')
        .getByUser(req.user.id, req.branch)
        .then(function(account) {
          if(!account) req.role = 'Visitor'; // If not existing, set role to Visitor
          else req.role = account.type.charAt(0).toUpperCase() + account.type.slice(1); // Capitalize first letter

          req.account = account;
        });
    })
    .then(function () {
      // console.log(req.role);
      next();
    })
    .catch(next);
};
