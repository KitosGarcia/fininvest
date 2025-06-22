const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");

router.get("/", companyController.getCompanyProfile);
router.post("/", companyController.updateCompanyProfile);

module.exports = router;
