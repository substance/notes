// Update with your config settings.

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/development.hub.sqlite3'
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: './test.hub.sqlite3'
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './db/production.hub.sqlite3'
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'knex_migrations'
    }
  }
};