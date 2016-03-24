exports.up = function(knex, Promise) {
  return knex.schema.createTable('documents', function(table) {
    table.string('documentId').unique().index();
    table.string('schemaName');
    table.string('schemaVersion');
    table.string('info');
    table.integer('version');
    table.string('title');
    table.integer('updatedAt');
    table.string('updatedBy');
    table.string('userId');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('documents');
};