'use strict';

var path = require('path');

var Container = require(path.join(process.cwd(), 'lib', 'installation-container.js'));

var containers = {};

module.exports = function (req, res, next) {
  var containerId = req.installationId + '-' + req.installationName;

  var container = null;

  if (containers[containerId]) {
    req.container = containers[containerId];
  } else {
    container = new Container(req);
    containers[containerId] = container;
    req.container = containers[containerId];
  }

  return next();
};
