exports.up = function(knex, Promise) {
  return knex.schema.createTable('Teachers', function (t) {
    t.increments(); // Sets ID column AUTO_INCREMENT Integer
    t.boolean('active');
    t.text('bio', 'longtext');
    t.float('base_wage'); // Default precision of 8 and scale of 2
    t.string('account_number', 255);
    t.text('void_check', 'longtext'); // Longtext because this will be a URL or path
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Teachers');
};
