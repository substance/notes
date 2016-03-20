exports.up = function(knex, Promise) {
  return knex.schema.createTable('snapshots', function(table) {
    table.string('documentId');
    table.integer('version');
    table.string('data');
    table.integer('timestamp');
    table.primary(['documentId', 'version']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('snapshots');
};