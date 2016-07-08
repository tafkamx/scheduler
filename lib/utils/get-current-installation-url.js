'use strict';

/**
 * Returns a URL useable by the front end to use in its Installation-specific
 * requests.
 *
 * This function is meant for when the front end wants to get a URL to the
 * current Installation, i.e. a login link or something of the sort.
 *
 * @param {Object} req The request object
 * @param {String} req.protocol The request's protocol (http, https)
 * @param {String} req.hostname The request's host name, i.e. default.installation.domain.tld
 * @param {Boolean} [skipPort] Whether to skip adding the port
 * @return {String} The full Installation URL
 */
module.exports = function (req, skipPort) {
  skipPort = skipPort || false;

  var result = '';

  var port = null;

  if (!skipPort && CONFIG.environment.match(/(test|development)/)) {
    port = CONFIG[CONFIG.environment].port;
  }

  result += req.protocol;
  result += '://';
  result += req.branch + '.' + req.installationName + '.' + CONFIG[CONFIG.environment].defaultDomainName;

  if (port !== null) {
    result += ':';
    result += port;
  }

  return result;
};
