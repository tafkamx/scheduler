exports.up = function(knex, Promise) {
  return knex.schema.createTable('Accounts', function (t) {
    t.uuid('id').primary();
    t.uuid('user_id'); // This can be NULL for Accounts that do not have Authentication
    t.uuid('branch_id').notNullable();
    t.string('type', 25).notNullable();
    t.string('first_name', 125);
    t.string('last_name', 125);
    t.date('dob');
    t.string('address_line1', 255);
    t.string('address_line2', 255);
    t.string('city', 255);
    t.string('state', 255);
    t.string('country', 48); // Longest country name in the world is 45 Letters "of Great Britain and Northern Ireland"
    t.string('postal_code', 48);
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Accounts');
};
