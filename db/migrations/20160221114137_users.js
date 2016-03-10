exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.string('userId').primary();
    table.string('name');
    table.string('email').unique();
    table.integer('createdAt');
    table.string('loginKey').unique().index();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};