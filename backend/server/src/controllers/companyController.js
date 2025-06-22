const db = require('../config/db'); // caminho correto
const TABLE = "company_profile";

/**
 * GET /api/company
 * Busca o perfil da empresa (apenas um registo)
 */
exports.getCompanyProfile = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM ${TABLE} LIMIT 1`);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error("Erro ao buscar dados da empresa:", err.stack);
    res.status(500).json({ error: "Erro ao buscar dados da empresa." });
  }
};

/**
 * POST /api/company
 * Cria ou atualiza o perfil da empresa
 */
exports.updateCompanyProfile = async (req, res) => {
  const {
    name = '',
    nif = '',
    address = '',
    email = '',
    phone = '',
    website = '',
    logo_url = null
  } = req.body;

  try {
    // Verifica se já existe um registo
    const existing = await db.query(`SELECT id FROM ${TABLE} LIMIT 1`);

    if (existing.rows.length === 0) {
      // Inserir novo registo
      const insert = `
        INSERT INTO ${TABLE} (name, nif, address, email, phone, website, logo_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;
      const values = [name, nif, address, email, phone, website, logo_url];
      const result = await db.query(insert, values);
      return res.json(result.rows[0]);
    } else {
      // Atualizar registo existente
      const update = `
        UPDATE ${TABLE}
        SET name = $1,
            nif = $2,
            address = $3,
            email = $4,
            phone = $5,
            website = $6,
            logo_url = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *`;
      const values = [
        name,
        nif,
        address,
        email,
        phone,
        website,
        logo_url,
        existing.rows[0].id
      ];
      const result = await db.query(update, values);
      return res.json(result.rows[0]);
    }

  } catch (err) {
    console.error("Erro ao atualizar dados da empresa:", err.stack);
    res.status(500).json({ error: "Erro ao atualizar dados da empresa." });
  }
};
