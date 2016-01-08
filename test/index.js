expect = require('chai').expect;
sa = require('superagent');
baseURL = 'http://localhost:3000';
var Promise = require('bluebird');

require(process.cwd() + '/bin/server.js');
require('./integration/controllers/InstallationAdmin/AdminUsersController');
require('./integration/controllers/InstallationAdmin/InstallationsController');
require('./integration/controllers/InstallationAdmin/SessionsController');
require('./integration/controllers/UsersController');
require('./integration/controllers/SessionsController');

logger.log = function(){};
logger.info = logger.log;
logger.error = logger.log;
