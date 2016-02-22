exports.up = function(knex, Promise) {
  return knex.schema.createTable('sessions', function(table) {
    table.string('sessionToken').primary();
    table.integer('timestamp');
    table.integer('userId');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('sessions');
};