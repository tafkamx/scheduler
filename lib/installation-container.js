'use strict';

var path = require('path');

var generateModels = require(path.join(process.cwd(), 'lib', 'utils', 'generate-models.js'));

var InstallationContainer = Class({}, 'InstallationContainer')({
  prototype: {
    containerId: null,

    models: {},

    init: function (req) {
      var that = this;

      that.containerId = req.installationId + '-' + req.installationName;

      // For now we can assume that `req.knex` exists, normally would be fetched in the containers middleware
      that.models = generateModels(Container.models, req.knex);
    },

    // returns model's query builder
    query: function (modelName) {
      var that = this;

      console.log(that.models)
      return that.models[modelName].query();
    },

    create: function (modelName, body) {},

    update: function (modelName, body) {},

    // This or just use query().some.query.here.destroy()
    // I think using .query() would be better, since this is more roundabout.
    delete: function (queryBuilder) {},
  },
});

module.exports = InstallationContainer;
