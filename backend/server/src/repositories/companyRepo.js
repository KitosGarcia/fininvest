const db = require("../db/db");

// Como a tabela é singleton, basta pegar a 1ª linha
exports.getProfile = () =>
  db("company_profile").first();      // { name, nif, address, ... }
