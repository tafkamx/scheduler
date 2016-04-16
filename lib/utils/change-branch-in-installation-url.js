'use strict';

/**
 * Returns a new URL, based on the one it is provided, where the Branch name
 * has been switched up for another one, or if there was no Branch name, it
 * inserts one.
 *
 * @param {String} installationUrl The URL in which to replace the Branch
 * @param {String} newBranchName The name of the new Branch
 * @return {String} The full Installation URL
 */
module.exports = function (installationUrl, newBranchName) {
  var result = '',
    protocol = null,
    port = null;

  // Get array with the host parts
  var dotSplits = installationUrl.match(/([\w-])+/g);

  // Remove https? if it's present
  if (dotSplits[0].search(/^https?$/) !== -1) {
    protocol = dotSplits.shift();
  }

  // Remove port (i.e. numbers) if it's present and save it for later
  if (dotSplits[dotSplits.length-1].search(/^\d+$/) !== -1) {
    port = dotSplits.pop();
  }

  if (dotSplits.length === 4) { // 4 length means there is a branch
    // replace old Branch name with newBranchName
    dotSplits[0] = newBranchName;
  } else if (dotSplits.length === 3) { // 3 length means there isn't a branch
    // add to beginning of array
    dotSplits.unshift(newBranchName);
  } else { // we don't know how to handle this case
    throw new Error('Provided URL splits into an invalid length (' + dotSplits.length + ')');
  }

  // Add protocol, if present
  result += (protocol !== null ? '' + protocol + '://' : '');

  result += dotSplits.join('.');

  // Add port, if present
  result += (port !== null ? ':' + port : '');

  return result;
};
