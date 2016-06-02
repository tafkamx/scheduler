
exports.up = function(knex, Promise) {
  return knex.schema.table('Accounts', function (t) {
    t.dropColumn('address_line_1');
    t.dropColumn('address_line_2');
    t.dropColumn('city');
    t.dropColumn('state');
    t.dropColumn('country');
    t.dropColumn('postal_code');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('Accounts', function (t) {
    t.string('address_line_1', 255);
    t.string('address_line_2', 255);
    t.string('city', 255);
    t.string('state', 255);
    t.string('country', 48);
    t.string('postal_code', 48);
  });
};
