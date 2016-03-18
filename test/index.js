expect = require('chai').expect;
sa = require('superagent');
var Promise = require('bluebird');
var path = require('path');


baseURL = 'http://localhost:3000';


require(path.join(process.cwd(), '/bin/server.js'));
require(path.join(__dirname, '/integration/controllers/InstallationManager/UsersController'));
require(path.join(__dirname, '/integration/controllers/InstallationManager/InstallationsController'));
require(path.join(__dirname, '/integration/controllers/InstallationManager/SessionsController'));
require(path.join(__dirname, '/integration/controllers/UsersController'));
require(path.join(__dirname, '/integration/controllers/SessionsController'));
require(path.join(__dirname, '/unit/mailers/UserMailer'));
