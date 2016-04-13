
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('ResetPasswordTokens', function (t) {
      t.uuid('id').primary();
      t.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('Users')
        .onDelete('CASCADE');
      t.string('token', 512);
      t.timestamp('expires_at').notNullable();
      t.timestamps();
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ResetPasswordTokens');
};
