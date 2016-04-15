var path = require('path');

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
require(path.join(process.cwd(), '/lib/', 'RestAPI.js'));

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

Krypton.QueryBuilder.prototype.page = function(page, pageSize) {
  pageSize = pageSize || 50;

  return this.range(page * pageSize, (page + 1) * pageSize - 1);
}

Krypton.QueryBuilder.prototype.range = function(start, end) {
  return this
    .limit(end - start + 1)
    .offset(start)
}


// Dynamic Model, i.e. you *must* provide a Knex instance
Class('DynamicModel').inherits(Krypton.Model).includes()({});

// ACL
require('scandium-express');
require(path.join(process.cwd(), 'lib', 'ACL', 'visitor.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'admin.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'franchisor.js'));

// Namespace
global.InstallationManager = {};

// Set InstallationManager Knex instance
var installationManagerKnex = require('knex')(CONFIG.database[CONFIG.environment]);

InstallationManager.InstallationManagerModel = Class(InstallationManager, 'InstallationManagerModel').inherits(Krypton.Model).includes()({});

InstallationManager.InstallationManagerModel.knex(installationManagerKnex);
