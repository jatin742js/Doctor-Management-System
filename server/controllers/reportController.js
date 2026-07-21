// controllers/reportController.js
const Report = require("../models/report");
const Doctor = require("../models/doctor"); // ✅ Import Doctor model
// const s3Service = require("../services/s3Service");

// =======================================================
// ✅ Get all reports for logged-in (JWT-authenticated) user
// =======================================================
exports.getReports = async (req, res) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Unauthorized: Please login" });

    const reports = await Report.find({ userId: req.user.userId })
      .populate({ path: 'doctor', select: 'name specialization' })
      .populate({ path: 'patient', select: 'name contact gender age' })
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error("[ReportController] Error fetching reports:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================================================
// ✅ Get single report by ID
// =======================================================
exports.getReportById = async (req, res) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Unauthorized: Please login" });

    const report = await Report.findOne({ _id: req.params.id, userId: req.user.userId })
      .populate({ path: 'doctor', select: 'name specialization' })
      .populate({ path: 'patient', select: 'name contact gender age' });
    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json(report);
  } catch (error) {
    console.error("[ReportController] Error fetching single report:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================================================
// ✅ Create new report
// =======================================================
exports.createReport = async (req, res) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Unauthorized: Please login" });

    const newReport = new Report({
      ...req.body,
      userId: req.user.userId,
    });

    const saved = await newReport.save();
    await saved.populate({ path: 'doctor', select: 'name specialization' });
    await saved.populate({ path: 'patient', select: 'name contact gender age' });
    res.status(201).json(saved);
  } catch (error) {
    console.error("[ReportController] Error creating report:", error);
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
};

// =======================================================
// ✅ Update report
// =======================================================
exports.updateReport = async (req, res) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Unauthorized: Please login" });

    const updated = await Report.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate({ path: 'doctor', select: 'name specialization' })
     .populate({ path: 'patient', select: 'name contact gender age' });

    if (!updated) return res.status(404).json({ message: "Report not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error("[ReportController] Error updating report:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================================================
// ✅ Delete report + attached file (from S3/R2)
// =======================================================
exports.deleteReport = async (req, res) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Unauthorized: Please login" });

    const report = await Report.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Delete associated file from S3/R2 if exists
    // if (report.fileUrl) {
    //   try {
    //     await s3Service.deleteObject({ key: report.fileUrl });
    //   } catch (err) {
    //     console.error("[ReportController] Failed to delete file from S3:", err);
    //   }
    // }

    await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("[ReportController] Error deleting report:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================================================
// ✅ Get presigned GET URL for a report file
// =======================================================
// exports.getPresignedUrl = async (req, res) => {
//   try {
//     if (!req.user?.userId)
//       return res.status(401).json({ message: "Unauthorized: Please login" });

//     const report = await Report.findOne({ _id: req.params.id, userId: req.user.userId });
//     if (!report) return res.status(404).json({ message: "Report not found" });
//     if (!report.fileUrl) return res.status(404).json({ message: "No file attached to this report" });

//     const url = await s3Service.getPresignedGetUrl({ key: report.fileUrl, expiresIn: 60 * 60 });
//     res.status(200).json({ url });
//   } catch (error) {
//     console.error("[ReportController] Error generating presigned URL:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// =======================================================
// ✅ Upload file for a report (to S3/R2)
// =======================================================
// exports.uploadFile = async (req, res) => {
//   try {
//     if (!req.user?.userId)
//       return res.status(401).json({ message: "Unauthorized: Please login" });

//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//     const report = await Report.findOne({ _id: req.params.id, userId: req.user.userId });
//     if (!report) return res.status(404).json({ message: "Report not found" });

//     // Build a key suitable for S3/R2
//     const safeName = (req.file.originalname || "file").replace(/\s+/g, "_");
//     const key = `reports/${req.user.userId}/${Date.now()}-${safeName}`;

//     await s3Service.uploadBuffer({
//       key,
//       buffer: req.file.buffer,
//       contentType: req.file.mimetype,
//     });

//     // Save reference to the uploaded file
//     report.fileUrl = key;
//     await report.save();

//     const presignedUrl = await s3Service.getPresignedGetUrl({ key, expiresIn: 60 * 60 });

//     res.status(200).json({
//       message: "File uploaded successfully",
//       fileUrl: key,
//       presignedUrl,
//     });
//   } catch (error) {
//     console.error("[ReportController] File upload error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// =======================================================
// ✅ Get distinct report titles (for dropdown suggestions)
// =======================================================
exports.getTitles = async (req, res) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Unauthorized: Please login" });

    const titles = await Report.distinct("title", { userId: req.user.userId });
    res.status(200).json(titles);
  } catch (error) {
    console.error("[ReportController] Error fetching titles:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================================================
// ✅ Get doctors list for dropdown (name + specialization)
// =======================================================
exports.searchDoctors = async (req, res) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Unauthorized: Please login" });

    const doctors = await Doctor.find({ userId: req.user.userId })
      .select("name specialization");

    res.status(200).json(doctors);
  } catch (error) {
    console.error("[ReportController] Error fetching doctors:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// =======================================================
// ✅ Mark report as read
// =======================================================
exports.markReportAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    report.read = true; // mark as read
    await report.save();

    res.status(200).json({ success: true, message: "Report marked as read" });
  } catch (err) {
    console.error("[ReportController] markReportAsRead error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
