var path = require('path');
var glob = require('glob');

// Custom Errors
global.NotFoundError = function NotFoundError(message) {
  this.name = 'NotFoundError';
  this.message = message || 'Not Found';
}

NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

// Load LithiumEngine
if (CONFIG.enableLithium) {
  require('./LithiumEngine.js');
}

// Routes
CONFIG.router = require(path.join(process.cwd(), 'config', 'routeMapper.js'));

// We need Krypton now, not when it's loaded later
require('krypton-orm');

// UUID as IDs
var uuid = require('uuid');
var oldKrInit = Krypton.Model.prototype.init;

Krypton.Model.prototype.init = function(config) {
  oldKrInit.call(this, config);

  var model = this;

  this.on('beforeCreate', function(next) {
    try {
      model.id = uuid.v4();
      return next();
    } catch (err) {
      return next(err);
    }
  });

  return this;
}

// Dynamic Model, i.e. you *must* provide a Knex instance
Class('DynamicModel').inherits(Krypton.Model)({});

// ACL
require('scandium-express');
require(path.join(process.cwd(), 'lib', 'ACL', 'visitor.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'admin.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'franchisee.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'franchisor.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'teacher.js'));

// Namespace
global.InstallationManager = {};
global.M = {};

// Set InstallationManager Knex instance
var installationManagerKnex = require('knex')(CONFIG.database[CONFIG.environment]);
Class(InstallationManager, 'InstallationManagerModel').inherits(Krypton.Model)({});
InstallationManager.InstallationManagerModel.knex(installationManagerKnex);

require(path.join(process.cwd(), 'lib', 'core', 'mailers', 'BaseMailer.js'));

// Load mailers
glob.sync('mailers/**/*.js').forEach(function (file) {
  require(path.join(process.cwd(), file));
});
