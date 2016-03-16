// Update with your config settings.

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'patos-installation-admin'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory : 'migrations-installation-admin'
    }
  },
  test : {
    client: 'postgresql',
    connection: {
      database: 'patos-installation-admin-test'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory : 'migrations-installation-admin'
    }
  }
};
