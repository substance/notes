exports.up = function(knex, Promise) {
  return knex.schema.createTable('changes', function(table) {
    table.string('id');
    table.string('changeset');
    table.integer('pos');
    table.string('data');
    table.integer('timestamp');
    table.string('user');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('changes');
};