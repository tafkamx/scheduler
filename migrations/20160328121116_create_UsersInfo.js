exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('UsersInfo', function (t) {
      t.uuid('id').primary();
      t.uuid('user_id').unique().notNullable();
      t.boolean('is_admin').notNullable();
      t.timestamps();
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('UsersInfo');
};
