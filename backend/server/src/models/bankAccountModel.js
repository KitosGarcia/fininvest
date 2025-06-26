const db = require("../config/db");

const BankAccount = {
  create: async ({ account_name, bank_name, iban, account_type, initial_balance, currency }) => {
    const current_balance = initial_balance || 0;
    const query = `
      INSERT INTO bank_accounts (
        account_name, bank_name, iban, account_type,
        initial_balance, current_balance, currency, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING *;
    `;
    const values = [
      account_name, bank_name, iban, account_type,
      current_balance, current_balance, currency || "EUR"
    ];

    const { rows } = await db.query(query, values);

    if (current_balance !== 0) {
      await db.query(`
        INSERT INTO fund_transactions (
          bank_account_id, transaction_type, amount, transaction_date,
          description, related_entity_type, related_entity_id
        ) VALUES ($1, 'initial_balance', $2, CURRENT_TIMESTAMP,
                  'Saldo inicial da conta', 'bank_account', $3);
      `, [rows[0].account_id, current_balance, rows[0].account_id]);
    }

    return rows[0];
  },

  findAll: async (includeInactive = false) => {
    const query = includeInactive
      ? "SELECT * FROM bank_accounts ORDER BY account_name;"
      : "SELECT * FROM bank_accounts WHERE is_active = TRUE ORDER BY account_name;";
    const { rows } = await db.query(query);
    return rows;
  },

  findById: async (id) => {
    const query = "SELECT * FROM bank_accounts WHERE account_id = $1;";
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let i = 1;

    for (const key of ["account_name", "bank_name", "iban", "account_type", "is_active", "currency"]) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(updates[key]);
      }
    }

    if (!fields.length) throw new Error("Nenhum campo válido para atualizar.");

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE bank_accounts SET ${fields.join(", ")}
      WHERE account_id = $${i}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);
    if (!rows.length) throw new Error("Conta não encontrada para atualização.");
    return rows[0];
  },

  delete: async (id) => {
    const check = await db.query("SELECT 1 FROM fund_transactions WHERE bank_account_id = $1 LIMIT 1;", [id]);
    if (check.rows.length > 0) {
      throw new Error("Esta conta tem transações associadas. Use inativação em vez de deletar.");
    }

    const query = "DELETE FROM bank_accounts WHERE account_id = $1 RETURNING *;";
    const { rows } = await db.query(query, [id]);
    if (!rows.length) throw new Error("Conta bancária não encontrada.");
    return rows[0];
  },

  updateBalance: async (accountId, amount, client = db) => {
    const query = `
      UPDATE bank_accounts
      SET current_balance = current_balance + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE account_id = $2
      RETURNING current_balance;
    `;

    const { rows } = await client.query(query, [amount, accountId]);
    if (!rows.length) throw new Error("Conta bancária não encontrada.");
    return rows[0].current_balance;
  },
};

module.exports = BankAccount;
