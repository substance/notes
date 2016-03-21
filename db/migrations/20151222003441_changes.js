exports.up = function(knex, Promise) {
  return knex.schema.createTable('changes', function(table) {
    table.string('documentId');
    table.integer('version');
    table.string('data');
    table.integer('createdAt');
    table.primary(['documentId', 'version']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('changes');
};