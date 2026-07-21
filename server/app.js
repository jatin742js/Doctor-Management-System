require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes"); // ✅ doctor routes
const authenticateJWT = require("./middleware/authMiddleware"); // ✅ JWT middleware
const settingsRoutes = require("./routes/settingsRoutes");
const billingRoutes = require("./routes/billingRoutes"); 
const prescriptionRoutes = require("./routes/prescriptionRoutes"); // ✅ prescription routes
const reportRoutes = require("./routes/reportRoutes"); // ✅ report routes
const dashboardRoutes = require("./routes/dashboardRoutes"); // ✅ dashboard routes
const forgetPasswordRoutes = require("./routes/forgetPasswordRoutes"); // ✅ forget password routes



const app = express();

// Frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// CORS
app.use(cors({
  origin: true,   // allow only frontend
  credentials: true,      // allow cookies / credentials
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", authenticateJWT, appointmentRoutes); // protect appointments
app.use("/api/patients", authenticateJWT, patientRoutes);         // protect patients
app.use("/api/doctors", authenticateJWT, doctorRoutes); 
app.use("/api/settings", authenticateJWT, settingsRoutes);          // protect doctors
app.use("/api/billing", authenticateJWT, billingRoutes); 
app.use("/api/prescriptions", authenticateJWT, prescriptionRoutes); // protect prescriptions
app.use("/api/reports", authenticateJWT, reportRoutes);             // protect reports
app.use("/api/dashboard", authenticateJWT, dashboardRoutes);       // protect dashboard 
app.use("/api", forgetPasswordRoutes); // ✅ forget password routes

console.log("MONGO_URI =", process.env.MONGO_URI);
// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
