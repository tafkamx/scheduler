
exports.up = function(knex, Promise) {
  return Promise.resolve()
    .then(function () {
      return knex.schema.table('UsersInfo', function (t) {
        t.foreign('user_id')
          .references('id')
          .inTable('Users')
          .onDelete('CASCADE');
      });
    });
};

exports.down = function(knex, Promise) {
  return Promise.resolve(); // Deleted in PATOS-157. Function no longer necessary.
};
