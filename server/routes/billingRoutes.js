const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const authenticateJWT = require("../middleware/authMiddleware"); // ✅ Import JWT middleware

// ✅ JWT-Protected Billing Routes
router.get("/", authenticateJWT, billingController.getInvoices);
router.get("/:id", authenticateJWT, billingController.getInvoiceById);
router.post("/", authenticateJWT, billingController.createInvoice);
router.put("/:id", authenticateJWT, billingController.updateInvoice);
router.delete("/:id", authenticateJWT, billingController.deleteInvoice);

module.exports = router;
