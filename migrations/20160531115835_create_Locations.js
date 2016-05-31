
exports.up = function(knex, Promise) {
  return knex.schema.createTable('Locations', function (t) {
    t.uuid('id').primary();
    t.string('name', 255);
    t.string('address1', 255);
    t.string('address2', 255);
    t.string('city', 255);
    t.string('state', 255);
    t.string('country', 255);
    t.string('postal_code', 255);
    t.string('latitude', 255);
    t.string('longitude', 255);
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Locations');
};
