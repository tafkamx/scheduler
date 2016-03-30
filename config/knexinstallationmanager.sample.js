// Update with your config settings.

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'patos-installation-manager'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory : 'migrations-installation-manager'
    }
  },
  test : {
    client: 'postgresql',
    connection: {
      database: 'patos-installation-manager-test'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory : 'migrations-installation-manager'
    }
  }
};
