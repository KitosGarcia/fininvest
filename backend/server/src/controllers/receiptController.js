// src/controllers/receiptController.js
const receiptService = require('../services/receiptService');

exports.generate = async (req, res, next) => {
  try {
    const { id } = req.params;               // id do payment
    const pdfBuffer = await receiptService.buildPDF(id, req.user.user_id);

    res
      .status(201)
      .set({ 'Content-Type': 'application/pdf' })
      .send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
