
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('UsersInfo', function (t) {
      t.uuid('id').primary();
      t.uuid('user_id')
        .unique()
        .notNullable()
        .references('id')
        .inTable('Users')
        .onDelete('CASCADE');
      t.string('role').notNullable();
      t.timestamps();
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('UsersInfo');
};
