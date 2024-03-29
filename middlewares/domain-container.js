'use strict';

var Promise = require('bluebird');
var path = require('path');

var DomainContainer = require('domain-container');
var _ = require('lodash');
var knex = require('knex');

var getCurrentInstallationUrl = require(path.join(process.cwd(), 'lib', 'utils', 'get-current-installation-url.js'));

var containers = {};
neonode.containers = containers;

module.exports = function (req, res, next) {
  var name = req.installationName;

  if (name === false) {
    return next();
  }

  Promise.resolve()
    .then(function () {
      if (_.isUndefined(containers[name])) {
        return Promise.resolve(false);
      }

      req.container = containers[name];

      return Promise.resolve(true);
    })
    .then(function (skipThis) {
      if (skipThis) {
        return Promise.resolve();
      }

      var conf = require(path.join(process.cwd(), 'knexfile.js'));
      var knexName = [req.installationName, CONFIG.environment].join('-');
      conf[CONFIG.environment].connection.database = knexName;
      var knexInst = knex(conf[CONFIG.environment]);

      var container = new DomainContainer({
        props : {
          installationName : req.installationName
        },
        knex: knexInst,
        models: M,
        modelExtras: {
          mailers: {
            user: new UserMailer(),
          },
        },
      });

      containers[name] = container;
      req.container = containers[name];

      return Promise.resolve();
    })
    .then(function () {
      return next();
    })
    .catch(next);
};
