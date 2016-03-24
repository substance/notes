exports.up = function(knex, Promise) {
  return knex.schema.createTable('changes', function(table) {
    table.string('documentId');
    table.integer('version');
    table.string('data');
    table.integer('createdAt');
    table.string('userId');
    table.primary(['documentId', 'version']);

    // Index so we can query by documentId and or userId (needed to extract collaborators)
    table.index(['documentId']);
    table.index(['userId']);
    table.index(['documentId', 'userId']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('changes');
};