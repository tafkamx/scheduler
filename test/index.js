expect = require('chai').expect;
sa = require('superagent');
var Promise = require('bluebird');
var path = require('path');


baseURL = 'http://localhost:3000';


require(path.join(process.cwd(), '/bin/server.js'));
require(path.join(__dirname, '/integration/controllers/InstallationAdmin/AdminUsersController'));
require(path.join(__dirname, '/integration/controllers/InstallationAdmin/InstallationsController'));
require(path.join(__dirname, '/integration/controllers/InstallationAdmin/SessionsController'));
require(path.join(__dirname, '/integration/controllers/UsersController'));
require(path.join(__dirname, '/integration/controllers/SessionsController'));
//
require(path.join(__dirname, '/unit/mailers/AdminUserMailer'));

logger.log = function(){};
logger.info = logger.log;
logger.error = logger.log;
