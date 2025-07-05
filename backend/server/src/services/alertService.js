const db = require('../db/db');

async function createAlert({ type, category, member_id = null, related_id = null, description }) {
  await db('alerts').insert({
    type,
    category,
    member_id,
    related_id,
    description
  });
}

module.exports = { createAlert };
