exports.up = function(knex, Promise) {
  return knex.schema.createTable('TeacherAvailability', function (t) {
    t.increments();
    t.uuid('teacher_id')
      .references('id')
      .inTable('Accounts')
      .onDelete('CASCADE');
    t.string('branch_name');
    t.integer('monday');
    t.integer('tuesday');
    t.integer('wednesday');
    t.integer('thursday');
    t.integer('friday');
    t.integer('saturday');
    t.integer('sunday');
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('TeacherAvailability');
};
