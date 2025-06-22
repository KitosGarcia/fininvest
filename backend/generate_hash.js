// Crie um arquivo generate_hash.js
const bcrypt = require('bcrypt');
const saltRounds = 10; // Deve ser o mesmo valor usado no backend
const password = 'admin123';

bcrypt.hash(password, saltRounds, function(err, hash) {
  console.log('Hash para a senha "admin123":', hash);
});