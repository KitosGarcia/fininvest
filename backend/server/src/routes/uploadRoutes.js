// src/routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({ dest: "uploads/" }); // ou configuração personalizada
const fs = require("fs");
const path = require("path");

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nenhum ficheiro enviado" });
  }

  // Aqui pode tratar e mover o arquivo se desejar, ou apenas retornar a URL
  const fileUrl = `/uploads/${req.file.filename}`; // ou algo como um link S3
  res.json({ url: fileUrl });
});

module.exports = router;
