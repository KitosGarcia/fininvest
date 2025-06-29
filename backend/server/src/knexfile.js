// knexfile.js
module.exports = {
  development: {
    client: "pg",        // ou "pg", "mssql"…
    connection: {
      host    : "localhost",
      user    : "fininvest_admin",
      password: "P@nor@m1x",
      database: "fininvest_db",
    },
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations" },
  },
  // podes copiar o bloco e ajustar para production / test
};
