const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const authenticateJWT = require("../middleware/authMiddleware"); // ✅ Import JWT middleware

// Search patients
router.get("/search", authenticateJWT, patientController.searchPatients);

// Get all patients
router.get("/", authenticateJWT, patientController.getPatientsJSON);

// Get a single patient by ID
router.get("/:id", authenticateJWT, patientController.getPatientByIdJSON);

// Add a new patient
router.post("/add", authenticateJWT, patientController.postAddPatientJSON);

// Update a patient by ID
router.put("/:id", authenticateJWT, patientController.updatePatientJSON);

// Delete a patient by ID
router.delete("/:id", authenticateJWT, patientController.deletePatientJSON);

module.exports = router;
