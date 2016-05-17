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

  new Promise(function(resolve, reject) {
    // Search for Account related to current Account and Branch
    req.container.get('Account')
    .getByUser(req.user.id, req.branch)
    .then(function(account) {
      if(!account) req.role = 'Visitor'; // If not existing, set role to Visitor
      else req.role = account.type.charAt(0).toUpperCase() + account.type.slice(1); // Capitalize first letter

      req.account = account;
      next();
    });
  })
  .then(next).catch(next);

  // TODO: Possibly also check to see if User ID is the Installation Franchisor, and set the Role to Franchisor in that case.
};
