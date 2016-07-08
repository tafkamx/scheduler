/*
 * Nonces are "number onces". They are used to verify GET or POST variables are coming from the correct User
 * and to do the right thing. This is used for cross-installation or cross-branch communication.
 *
 * These numbers can only be verified once, and should be generated any time there is a User-specific interaction
 * that could be abused to cause "bad things" to happen.
 *
 * It's being loaded as a utility module as it can and should be used in many different situations and files
 */
const crypto = require('crypto');
const DEFAULT_NONCE_DURATION = 1000 * 60 * 1;
const GC_INTERVAL = 1000 * 60 * 2;

// Global reference to nonces so that multiple instances of this file can verify all nonces
global.nonces = global.nonces || {};
global.isNonceRunning = false;

const Nonces = module.exports = {};

Nonces.createNonce = function(reason, duration, data, installationName, branchName) {
  var store = {
    reason: reason || '',
    setTime: Date.now(),
    duration: +duration || DEFAULT_NONCE_DURATION,
    data: data || null,
    installationName: installationName,
    branchName: branchName,
  };
  var nonce = crypto.randomBytes(24).toString('hex').substr(2, 15) + Date.now();
  global.nonces[nonce] = store;
  return nonce;
}

Nonces.validateNonce = function(nonce, reason) {
  var now = Date.now();
  if (!nonce) return false;
  if (!global.nonces[nonce]) return false;
  var store = global.nonces[nonce];
  if (reason && store.reason !== reason) return false;
  if (now - store.setTime > store.duration) return false;
  delete global.nonces[nonce];
  return store.data;
}

Nonces.gc = function() {
  var nonces = global.nonces;
  var now = Date.now();
  Object.keys(global.nonces).forEach(function(nonce) {
    if (now - global.nonces[nonce].setTime > global.nonces[nonce].duration) {
      delete global.nonces[nonce];
    }
  });
}

if (!global.isNonceRunning) {
  global.isNonceRunning = setInterval(Nonces.gc, GC_INTERVAL);
}
