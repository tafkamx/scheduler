'use strict';

module.exports = function (modelsObj, knex) {
  var result = {};

  Object.keys(modelsObj).forEach(function (modelName) {
    var model = Class({}, modelName)
      .inherits(Krypton.Model)
      .includes(modelsObj[modelName])
      ({});

    model.knex(knex);

    result[modelName] = model;
  });

  return result;
};
