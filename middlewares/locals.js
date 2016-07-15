// Use this middleware to set res.locals variables
const _ = require('lodash');
const onepath = require('onepath');
const loginTokenize = onepath.require('~/../../lib/utils/login-tokenize');
const getCurrentInstallationUrl = onepath.require('~/../../lib/utils/get-current-installation-url');
const generateInstallationUrl = onepath.require('~/../../lib/utils/generate-installation-url');
const changeBranchInInstallationUrl = onepath.require('~/../../lib/utils/change-branch-in-installation-url');

module.exports = LocalsMiddleware;

function LocalsMiddleware(req, res, next) {
  setCsrfToken(req, res);
  setHelpers(req, res);
  dumpUser(req, res);
  next();
}

// Apply CSRF Token
function setCsrfToken(req, res) {
  if (CONFIG[CONFIG.environment].sessions !== false && CONFIG.environment !== 'test') {
    res.locals.csrfToken = req.csrfToken();
  } else {
    res.locals.csrfToken = '';
  }
}

// Apply helpers namspace and helpers
function setHelpers(req, res) {
  if (!res.locals.helpers) res.locals.helpers = {};
  const helpers = {};

  helpers.urlFor = urlFor;
  helpers.filters = {};
  helpers.req = req;

  helpers.createInstallationUrl = function(installationName) {
    return `//${installationName}.${CONFIG[CONFIG.environment].defaultDomainName}`;
  }

  helpers.createBranchUrl = function(branchName) {
    return `//${branchName}.${req.installationName}.${CONFIG[CONFIG.environment].defaultDomainName}`;
  }

  helpers.createInstallationLoginToken = function(installationName) {
    if (!req.user) return '';
    var grantee = {id: req.user.id, email: req.user.email, grantee: req.user.grantee};
    return loginTokenize.createInstallationToken(grantee, installationName);
  }

  helpers.createBranchLoginToken = function(branchName) {
    if (!req.user) return '';
    var grantee = {id: req.user.id, email: req.user.email, grantee: req.user.grantee};
    return loginTokenize.createBranchToken(grantee, req.installationName, branchName);
  }

  // Installation URL helpers
  helpers.generateInstallationUrl = generateInstallationUrl;
  helpers.changeBranchInInstallationUrl = changeBranchInInstallationUrl;

  _.assign(res.locals.helpers, helpers);
}

// For debugging, drumps user so you can see who you are while using a guest account.
function dumpUser(req, res) {
  // Remove properties starting with an underscore.
  if (req.user) Object.keys(req.user).filter(function(x){return x[0] === '_'}).forEach(function(x){delete req.user[x]})
  res.locals.user = JSON.stringify(req.user || {}, null, 4) || 'Visitor'
  // res.locals.guest = JSON.stringify(req.session.guest || {}, null, 4) || ''
}