const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorcontroller");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, doctorController.getDoctors);
router.post("/", verifyToken, doctorController.postAddDoctor);
router.put("/:id", verifyToken, doctorController.updateDoctor);
router.delete("/:id", verifyToken, doctorController.deleteDoctor);
router.get("/search", verifyToken, doctorController.searchDoctors);

module.exports = router;
