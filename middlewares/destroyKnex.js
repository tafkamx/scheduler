'use strict';

module.exports = function (req, res, next) {
  logger.info('Knex listener added');
  res.once('finish', function () {
    if (req.knex) {
      logger.info('Destroying Knex instance');
      req.knex.destroy(function () {
        logger.info('Destroyed Knex instance');
      });
    }
  });

  return next();
};
