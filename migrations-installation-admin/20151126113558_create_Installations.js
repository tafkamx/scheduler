
exports.up = function(knex, Promise) {
  return Promise.all([knex.schema.createTable('Installations', function(t) {
    t.uuid('id').primary();
    t.string('name', 128).unique().notNullable();
    t.string('domain', 255).defaultTo(null);
    t.timestamps();
  })]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('Installations')]);
};
