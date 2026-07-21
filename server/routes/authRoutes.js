const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register a new user
router.post("/register", authController.register);

// Login existing user
router.post("/login", authController.login);

// Logout user (client deletes token)
router.post("/logout", authController.logout);

module.exports = router;
