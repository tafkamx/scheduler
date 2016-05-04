
exports.up = function(knex, Promise) {
  return knex.schema.createTable('BranchSettings', function(t) {
    t.uuid('id').primary();
    t.uuid('branch_id')
      .unique()
      .references('id')
      .inTable('Branches')
      .onDelete('CASCADE');
    t.string('language').notNullable();
    t.string('currency').notNullable();
    t.string('timezone').notNullable();
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('BranchSettings');
};
