#!/bin/bash
echo "🔧 Criando modelo Currency..."
npx sequelize-cli model:generate --name Currency --attributes name:string,symbol:string,code:string,isMain:boolean

echo "✅ Modelo e migration criados. Ajusta a migration gerada em /migrations para conter:"
echo " - unique: true no campo 'code'"
echo " - defaultValue: false no campo 'isMain'"
echo
echo "🔧 Criando controller e rotas..."
mkdir -p src/controllers
cat <<EOF > src/controllers/currencyController.js
const { Currency } = require('../models');

module.exports = {
  async index(req, res) {
    const currencies = await Currency.findAll();
    res.json(currencies);
  },
  async store(req, res) {
    const currency = await Currency.create(req.body);
    res.status(201).json(currency);
  },
  async update(req, res) {
    const { id } = req.params;
    await Currency.update(req.body, { where: { id } });
    const updated = await Currency.findByPk(id);
    res.json(updated);
  },
  async destroy(req, res) {
    const { id } = req.params;
    await Currency.destroy({ where: { id } });
    res.status(204).send();
  },
  async setMain(req, res) {
    const { id } = req.params;
    await Currency.update({ isMain: false }, { where: {} });
    await Currency.update({ isMain: true }, { where: { id } });
    res.json({ success: true });
  }
};
EOF

mkdir -p src/routes
cat <<EOF > src/routes/currencyRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/currencyController');

router.get('/', controller.index);
router.post('/', controller.store);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.put('/set-main/:id', controller.setMain);

module.exports = router;
EOF

echo
echo "🔧 Adiciona no src/routes/index.js:"
echo "  router.use('/currencies', require('./currencyRoutes'));"
