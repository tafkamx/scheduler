'use strict';

/**
 * Returns a URL useable by the front end to use in its Installation-specific
 * requests.
 *
 * This function is meant for when the front end wants to generate a URL to
 * another installation, i.e. a login link or something of the sort.
 *
 * @param {String} branchName The name of the branch
 * @param {String} installationName The name of the installation
 * @param {String} domainName The Installation's domain name
 * @return {String} The full Installation URL
 */
module.exports = function (branchName, installationName, domainName) {
  var result = '';

  // Can't assume it's HTTPS, but we can assume that the server will upgrade it
  // to HTTPS if it's available.
  result += 'http://';

  if (branchName) {
    result += branchName;
    result += '.';
  }

  result += installationName;
  result += '.';
  result += domainName || CONFIG[CONFIG.environment].defaultDomainName;
  // defaultDomainName should include the port, if it needs it
  result += (domainName ? ':' + CONFIG[CONFIG.environment].port : '');

  return result;
};
