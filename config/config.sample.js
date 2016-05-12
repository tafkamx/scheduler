var env = process.env.NODE_ENV || 'development';
var path = require('path');

var config = {
  appName : 'PatOS',
  environment : env,

  env: function () {
    return config[config.environment];
  },

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
      mailgun: {
        auth: {
          api_key: null,
          domain: null,
        },
      },
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
      mailgun: {
        auth: {
          api_key: null,
          domain: null,
        },
      },
    }
  }
}

config.logFile = path.join(process.cwd(), '/log/' + env + '.log');

config.database        = require('./../knexinstallationmanager.js');

config.middlewares     = require('./middlewares.js');

module.exports = config;
