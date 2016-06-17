#!/usr/bin/env node

var path = require('path');
var nodemailer = require('nodemailer');
var mailgun = require('nodemailer-mailgun-transport');
var glob = require('glob');

try {
  var neonode = require(path.join(process.cwd(), 'lib', 'core'));

  // Load model relations
  glob.sync('lib/model-relations/**/*.js').forEach(function (file) {
    require(path.join(process.cwd(), file));
  });

  var transport;

  if (CONFIG.environment === 'test') {
    transport = require('nodemailer-stub-transport')();
  } else {
    transport = mailgun(CONFIG[CONFIG.environment].mailer.mailgun);
  }

  BaseMailer.transport(nodemailer.createTransport(transport));

  // Start

  neonode._serverStart();
} catch (e) {
  logger.error(e.stack);
  process.exit(1);
}

// When there's an unhandled rejection just log the error and stop the process
process.on('unhandledRejection', function (err, promise) {
  logger.error(err);
  logger.error(err.stack);
  logger.error(promise);
  process.exit(1);
});
