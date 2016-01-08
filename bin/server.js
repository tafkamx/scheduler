#!/usr/bin/env node

var path = require('path');
var nodemailer = require('nodemailer');
var mandrillTransport = require('nodemailer-mandrill-transport');


var neonode = require(path.join(process.cwd(), '/lib/core'));

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
