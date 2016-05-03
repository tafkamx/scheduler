// Note that when this migration was written, users were not being handled yet,
// only admins, so this script assumes that there are only admins.

exports.up = function(knex, Promise) {
  return Promise.resolve()
    .then(function () {
      return knex.schema.table('UsersInfo', function (t) {
        t.string('role').notNullable();
        t.dropColumn('is_admin');
      });
    })
    .then(function () {
      knex('UsersInfo')
        .update('role', 'admin');
    });
};

exports.down = function(knex, Promise) {
  return Promise.resolve(); // Deleted in PATOS-157. No longer necessary.
};
