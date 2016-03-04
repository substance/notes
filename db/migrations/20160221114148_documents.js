exports.up = function(knex, Promise) {
  return knex.schema.createTable('documents', function(table) {
    table.string('documentId').unique().index();
    table.string('schemaName');
    table.string('schemaVersion');
    table.string('snapshot');
    table.integer('version');
    table.integer('userId');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('documents');
};