expect = require('chai').expect;
sa = require('superagent');
var Promise = require('bluebird');
var path = require('path');

global.baseURL = 'http://localhost:3000';

require(path.join(process.cwd(), '/bin/server.js'));
// controllers
require(path.join(__dirname, '/integration/controllers/InstallationManager/UsersController'));
require(path.join(__dirname, '/integration/controllers/InstallationManager/InstallationsController'));
require(path.join(__dirname, '/integration/controllers/InstallationManager/SessionsController'));
require(path.join(__dirname, '/integration/controllers/BranchesController'));
require(path.join(__dirname, '/integration/controllers/UsersController'));
require(path.join(__dirname, '/integration/controllers/SessionsController'));
// mailers
require(path.join(__dirname, '/unit/mailers/UserMailer'));
// models
require(path.join(__dirname, '/unit/models/User'));
require(path.join(__dirname, '/unit/models/UserInfo'));
require(path.join(__dirname, '/unit/models/ResetPasswordToken'));
require(path.join(__dirname, '/unit/models/InstallationManager/User'));
require(path.join(__dirname, '/unit/models/InstallationManager/UserInfo'));
require(path.join(__dirname, '/unit/models/InstallationManager/ResetPasswordToken'));
// utils
require(path.join(__dirname, '/unit/utils/nonces.js'));
require(path.join(__dirname, '/unit/utils/login-tokenize.js'));
