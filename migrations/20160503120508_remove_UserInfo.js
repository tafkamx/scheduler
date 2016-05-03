
exports.up = function(knex, Promise) {
  return knex.schema.dropTableIfExists('UsersInfo');
};

exports.down = function(knex, Promise) {
  return Promise; // Nothing needs to happen here.
};
