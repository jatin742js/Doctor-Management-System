const multer = require("multer");

// Use memory storage so uploaded file data is available as `req.file.buffer`.
const storage = multer.memoryStorage();

// Basic file filter - allow common document/image types. Adjust as needed.
const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Allowed: pdf, png, jpg, jpeg"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
