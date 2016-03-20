exports.up = function(knex, Promise) {
  return knex.schema.createTable('changes', function(table) {
    table.string('document');
    table.integer('pos');
    table.string('data');
    table.integer('timestamp');
    table.primary(['document', 'pos'])
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('changes');
};