const express = require("express");
const router = express.Router();
const forgetPasswordController = require("../controllers/forgetPasswordController");

// Protected route - must send JWT token
router.post("/forget-password", forgetPasswordController.apiForgetPassword);

module.exports = router;
