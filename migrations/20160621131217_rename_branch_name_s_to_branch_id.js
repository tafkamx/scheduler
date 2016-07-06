
exports.up = function(knex, Promise) {
  return Promise.resolve()
    // Accounts
    .then(function () {
      return knex.schema.table('Accounts', function (t) {
        t.dropColumn('branch_name');

        // Not making a foreign_id constraint because even if a Branch is
        // removed we may want to keep a backup of the data.
        t.uuid('branch_id').notNullable();
      });
    })
    // TeacherAvailability
    .then(function () {
      return knex.schema.table('TeacherAvailability', function (t) {
        t.dropColumn('branch_name');

        // Not making a foreign_id constraint because even if a Branch is
        // removed we may want to keep a backup of the data.
        // Also we have a `branch_id` for ease of query purposes.
        t.uuid('branch_id').notNullable();
      });
    });
};

exports.down = function(knex, Promise) {
  return Promise.resolve()
    // Accounts
    .then(function () {
      return knex.schema.table('Accounts', function (t) {
        t.dropColumn('branch_id');
        t.string('branch_name', 255).notNullable();
      });
    })
    // TeacherAvailability
    .then(function () {
      return knex.schema.table('TeacherAvailability', function (t) {
        t.dropColumn('branch_id');
        t.string('branch_name');
      });
    });
};
