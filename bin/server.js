#!/usr/bin/env node

var path = require('path');
var nodemailer = require('nodemailer');
var mailgun = require('nodemailer-mailgun-transport');
var glob = require('glob');

var neonode = require(path.join(process.cwd(), 'lib', 'core'));

// Load model relations
glob.sync('lib/model-relations/**/*.js').forEach(function (file) {
  require(path.join(process.cwd(), file));
});

// Mailer transport
var transport;

if (CONFIG.environment === 'test') {
  transport = require('nodemailer-stub-transport')();
} else {
  transport = mailgun(CONFIG[CONFIG.environment].mailer.mailgun);
}

BaseMailer.transport(nodemailer.createTransport(transport));

// Load mailers
glob.sync('mailers/**/*.js').forEach(function (file) {
  require(path.join(process.cwd(), file));
});

neonode._serverStart();
