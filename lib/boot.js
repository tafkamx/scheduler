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

require('krypton-orm');

var uuid = require('uuid');

var oldKrInit = Krypton.Model.prototype.init;

Krypton.Model.prototype.init = function(config) {
  oldKrInit.call(this, config);

  var model = this;

  this.on('beforeCreate', function(next) {
    model.id = uuid.v4();
    next();
  });

  return this;
}

Knex = require('knex');

var installationManagerKnex = require('knex')(CONFIG.database[CONFIG.environment]);

Class('InstallationManagerModel').inherits(Krypton.Model)({});

Class('DynamicModel').inherits(Krypton.Model)({});


InstallationManagerModel.knex(installationManagerKnex);

require('scandium-express');
require(path.join(process.cwd(), 'lib', 'ACL', 'visitor.js'));
require(path.join(process.cwd(), 'lib', 'ACL', 'admin.js'));

global.InstallationManager = {};
