const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// ✅ Protect route with JWT
router.get("/", verifyToken, dashboardController.getDashboard);

module.exports = router;
