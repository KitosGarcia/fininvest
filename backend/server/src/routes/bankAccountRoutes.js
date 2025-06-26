const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const bankAccountController = require("../controllers/bankAccountController");

router.use(authenticateToken);
router.use(authorizeRole(1)); // Apenas admin

router.get("/", bankAccountController.getAll);
router.get("/:id", bankAccountController.getById);
router.post("/", bankAccountController.create);
router.put("/:id", bankAccountController.update);
router.delete("/:id", bankAccountController.remove);

module.exports = router;
