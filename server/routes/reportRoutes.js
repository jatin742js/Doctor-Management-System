const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware"); 
// const upload = require("../middleware/multerMemory");

const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  searchDoctors,
  deleteReport,
  // uploadFile,
  // getPresignedUrl,
  markReportAsRead,
  getTitles, // For dropdown titles
} = require("../controllers/reportController");

// ✅ Protect all routes with JWT
router.use(verifyToken);

// ✅ Define static routes first
router.get("/titles", getTitles);        // Fetch report titles for dropdown
router.get("/", getReports);             // Get all reports
// router.get("/presign/:id", getPresignedUrl); // Get presigned file URL
router.post("/", createReport);          // Create report
router.put("/:id", updateReport);        // Update report
router.delete("/:id", deleteReport);     // Delete report
// router.post("/upload/:id", upload.single("file"), uploadFile); // Upload file
router.get("/:id", getReportById);       // Get single report by ID
router.get("/doctors", searchDoctors);
router.post("/:id/read", markReportAsRead)

module.exports = router;
