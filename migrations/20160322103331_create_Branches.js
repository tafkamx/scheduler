
exports.up = function(knex, Promise) {
  return knex.schema.createTable('Branches', function (t) {
    t.uuid('id').primary();
    t.string('name', 255).unique().notNullable();
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Branches');
};
