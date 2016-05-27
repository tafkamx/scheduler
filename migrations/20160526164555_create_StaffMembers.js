
exports.up = function(knex, Promise) {
  return knex.schema.createTable('StaffMembers', function (t) {
    t.increments();
    t.uuid('account_id')
      .references('id')
      .inTable('Accounts')
      .onDelete('CASCADE');
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('StaffMembers');
};
