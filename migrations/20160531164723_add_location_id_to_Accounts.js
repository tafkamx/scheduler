
exports.up = function(knex, Promise) {
  return knex.schema.table('Accounts', function (t) {
    t.uuid('location_id');
    // Not putting foreign key constraint key here as it may cause problems when
    // trying to change location or something of the sort
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('Accounts', function (t) {
    t.dropColumn('location_id');
  });
};
