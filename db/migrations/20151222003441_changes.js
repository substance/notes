exports.up = function(knex, Promise) {
  return knex.schema.createTable('changes', function(table) {
    table.string('id').primary();
    table.string('changeset');
    table.integer('pos');
    table.string('data');
    table.integer('timestamp');
    table.string('userId');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('changes');
};