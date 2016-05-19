
exports.up = function(knex, Promise) {
  return knex.schema.dropTableIfExists('UsersInfo');
};

exports.down = function(knex, Promise) {
  return knex.schema
    .createTable('UsersInfo', function (t) {
      t.uuid('id').primary();
      t.uuid('user_id').unique().notNullable();
      t.string('role').notNullable();
      t.timestamps();
    })
    .then(function () {
      knex('UsersInfo')
        .update('role', 'admin');
    });
};
