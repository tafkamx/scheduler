
exports.up = function(knex, Promise) {
  return Promise.all([knex.schema.createTable('Users', function(t) {
    t.uuid('id').primary();
    t.string('email', 255).unique().notNullable();
    t.string('encrypted_password', 512).notNullable();
    t.string('token', 512).defaultTo(null);
    t.timestamps();
  })]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('Users')]);
};
