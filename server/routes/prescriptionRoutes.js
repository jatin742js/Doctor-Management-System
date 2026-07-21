const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");
const authenticateJWT = require("../middleware/authMiddleware");

// 🔹 Create Prescription
router.post("/add", authenticateJWT, prescriptionController.createPrescription);

// 🔹 Get All Prescriptions
router.get("/", authenticateJWT, prescriptionController.getPrescriptions);

// 🔹 Get Single Prescription by ID
router.get("/:id", authenticateJWT, prescriptionController.getPrescriptionById);

// 🔹 Update Prescription
router.put("/:id", authenticateJWT, prescriptionController.updatePrescription);

// 🔹 Delete Prescription
router.delete("/:id", authenticateJWT, prescriptionController.deletePrescription);

// 🔹 Get Medicine Names
router.get("/medicines/names", authenticateJWT, prescriptionController.getMedicineNames);

// 🔹 Get Investigations
router.get("/filters/investigations", authenticateJWT, prescriptionController.getInvestigations);

// 🔹 Get Diagnoses
router.get("/filters/diagnoses", authenticateJWT, prescriptionController.getDiagnoses);

module.exports = router;
