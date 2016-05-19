
exports.up = function(knex, Promise) {
  return knex.schema.dropTableIfExists('UsersInfo');
};

exports.down = function(knex, Promise) {
  return Promise.resolve()
    .then(function () {
      return knex.schema
        .createTable('UsersInfo', function (t) {
          t.uuid('id').primary();
          t.uuid('user_id')
            .references('id')
            .inTable('Users')
            .onDelete('CASCADE');
          t.string('role').notNullable();
          t.timestamps();
        });
    });
};
