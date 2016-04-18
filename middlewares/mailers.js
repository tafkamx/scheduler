'use strict';

var path = require('path');

var getCurrentInstallationUrl = require(path.join(process.cwd(), 'lib', 'utils', 'get-current-installation-url.js'));

module.exports = function (req, res, next) {
  req.mailers = {
    user: new UserMailer({
      installationUrl: getCurrentInstallationUrl(req),
    }),
  };

  return next();
};
