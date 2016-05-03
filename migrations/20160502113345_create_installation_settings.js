
exports.up = function(knex, Promise) {
  return knex.schema.createTable('InstallationSettings', function(t) {
    t.uuid('id').primary();
    t.string('language').notNullable();
    t.string('currency').notNullable();
    t.string('timezone').notNullable();
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('InstallationSettings');
};
