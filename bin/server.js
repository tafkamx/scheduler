#!/usr/bin/env node

var path = require('path');
var nodemailer = require('nodemailer');
var mandrillTransport = require('nodemailer-mandrill-transport');
var glob = require('glob');

var neonode = require(path.join(process.cwd(), 'lib', 'core'));

// Load model relations
glob.sync('lib/model-relations/**/*.js').forEach(function (file) {
  require(path.join(process.cwd(), file));
});

// mailer

if (CONFIG.environment === 'test') {
  var stubTransport = require('nodemailer-stub-transport');
}

var transport = mandrillTransport({
  auth: {
    apiKey: CONFIG[CONFIG.environment].mailer.mandrillKey
  }
});

if (CONFIG.environment === 'test') {
  transport = stubTransport();
}

BaseMailer.transport(nodemailer.createTransport(transport));

neonode._serverStart();
