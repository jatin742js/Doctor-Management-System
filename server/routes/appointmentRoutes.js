const express = require("express");
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  markAddedToPatients,
} = require("../controllers/appointmentController");

const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);
router.patch("/:id/add-patient", markAddedToPatients);

module.exports = router;
