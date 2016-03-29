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

CONFIG.router = require(path.join(process.cwd(), 'config', 'routeMapper.js'));

require('krypton-orm');
require(path.join(process.cwd(), '/lib/', 'RestAPI.js'));

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

Knex = require('knex');

var installationAdminKnex = require('knex')(CONFIG.database[CONFIG.environment]);

installationAdminKnex.on('query', function(data) {
  // console.log(data)
});

Class('InstallationAdminModel').inherits(Krypton.Model).include(RestAPI)({});

Class('DynamicModel').inherits(Krypton.Model).include(RestAPI)({});

require('scandium-express');
require(path.join(process.cwd(), 'lib', 'ACL', 'visitor.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'admin.js'));

global.InstallationManager = {};

var installationManagerKnex = require('knex')(CONFIG.database[CONFIG.environment]);
InstallationManager.InstallationManagerModel = Class(InstallationManager, 'InstallationManagerModel').inherits(Krypton.Model)({});
InstallationManager.InstallationManagerModel.knex(installationManagerKnex);
