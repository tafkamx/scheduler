var env = process.env.NODE_ENV || 'development';
var path = require('path');

var config = {
  appName : 'PatOS',
  environment : env,

  development : {
    port : process.env.PORT || 3000,
    // sessions : false, if you want to disable Redis sessions
    sessions       : {
      key      : 'PatOS-IA',
      secret   : 'XYZ',
    },
    siteURL : 'http://localhost:3000',
    enableLithium : false,

    defaultDomainName : 'test-installation.com:3000',

    // mailer
    mailer : {
      sendEmails : false,
      mandrillKey : null
    }
  },

  production : {},
  test : {
    port : process.env.PORT || 3000,
    // sessions : false, if you want to disable Redis sessions
    sessions       : {
      key      : 'PatOS-IA',
      secret   : 'XYZ-test',
    },
    siteURL : 'http://localhost:3000',
    enableLithium : false,

    defaultDomainName : 'test-installation.com:3000',

    // mailer
    mailer : {
      sendEmails : false,
      mandrillKey : null
    }
  }
}

config.logFile = path.join(process.cwd(), '/log/' + env + '.log');

config.database        = require('./../knexinstallationadmin.js');

config.middlewares     = require('./middlewares.js');

module.exports = config;