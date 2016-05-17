
exports.up = function(knex, Promise) {
  return knex.schema.table('InstallationSettings', function (t) {
    t.uuid('franchisor_id')
      .notNullable()
      .references('id')
      .inTable('Users');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('InstallationSettings', function (t) {
    t.dropColumn('franchisor_id');
  });
};
