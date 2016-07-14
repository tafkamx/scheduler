/*
 * Login Tokenizers are for cross-installation and/or cross-branch guest Users.
 * This utility module provides the ability to create tokens good for installation-or-branch-specific login links.
 */
const bcrypt = require('bcrypt-node')
const onepath = require('onepath');
const nonces = onepath.require('~/../../lib/utils/nonces');
const secret = CONFIG[CONFIG.environment].sessions.secret;
const NONCE_REASON = 'cross-install-or-branch-login';
const DURATION = 1000 * 60 * 2;
const TOKEN_DELIMETER = '|';

const LoginTokenize = module.exports = {};

LoginTokenize.NONCE_REASON = NONCE_REASON;
LoginTokenize.TOKEN_DELIMETER = TOKEN_DELIMETER;

LoginTokenize.createInstallationToken = function(user, installationName, timestamp) {
  timestamp = +timestamp || Date.now();
  var grantee = user;
  grantee.grants = {
    access: 'Installation',
    role: 'Franchisor',
    installationName: installationName,
    expires: timestamp + DURATION
  };
  var nonce = nonces.createNonce(NONCE_REASON, DURATION, grantee, installationName);
  var uniqueSignature = `${secret}${nonce}${installationName}${timestamp}`; 
  var hash = bcrypt.hashSync(uniqueSignature);
  var b64EncodedHash = new Buffer(`${hash}|${nonce}|${timestamp}`).toString('base64');
  return b64EncodedHash;
}

LoginTokenize.createBranchToken = function(user, installationName, branchName, timestamp) {
  timestamp = +timestamp || Date.now();
  var grantee = user;
  grantee.grants = {
    access: 'Branch',
    role: 'Admin',
    installationName: installationName,
    branchName: branchName,
    expires: timestamp + DURATION
  };
  var nonce = nonces.createNonce(NONCE_REASON, DURATION, grantee, installationName, branchName);
  var uniqueSignature = `${secret}${nonce}${installationName}-${branchName}${timestamp}`;
  var hash = bcrypt.hashSync(uniqueSignature);
  var token = `${hash}|${nonce}|${timestamp}`;
  var b64EncodedToken = new Buffer(token).toString('base64');
  return b64EncodedToken;
}

LoginTokenize.validateToken = function(b64EncodedToken, installationName, branchName) {
  if (!b64EncodedToken) return false;
  var now = Date.now();
  var token = new Buffer(b64EncodedToken, 'base64').toString('utf8');
  var splitToken = token.split(TOKEN_DELIMETER, 3);
  var hash = splitToken[0];
  var nonce = splitToken[1];
  var timestamp = +splitToken[2];
  if (now - timestamp > 1000 * 60 * 1) return false;
  var data = nonces.validateNonce(nonce, NONCE_REASON);
  if (!data) return false;
  var uniqueSignature = `${secret}${nonce}${installationName}${branchName ? '-' + branchName : ''}${timestamp}`;
  if (!bcrypt.compareSync(uniqueSignature, hash)) return false;
  return data;
}
