#!/usr/bin/env node

var path = require('path');
var nodemailer = require('nodemailer');
var mandrillTransport = require('nodemailer-mandrill-transport');


var neonode = require(path.join(process.cwd(), '/lib/core'));


// mailer
var transport = nodemailer.createTransport(mandrillTransport({
  auth: {
    apiKey: CONFIG[CONFIG.environment].mailer.mandrillKey
  }
}));

BaseMailer.transport(transport);

neonode._serverStart();
