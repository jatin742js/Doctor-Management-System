const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const authenticateJWT = require("../middleware/authMiddleware"); // ✅ Import JWT middleware

// ✅ Protect both routes with JWT
router.get("/", authenticateJWT, settingsController.getSettings);
router.post("/update", authenticateJWT, settingsController.updateSettings);

module.exports = router;
