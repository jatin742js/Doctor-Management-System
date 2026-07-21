const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other", "N/A"], default: "N/A" },
    visiteddate: { type: Date, default: Date.now },
    age: { type: Number },
    address: { type: String, default: "N/A" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    history: { type: String, default: "" },
    medicines: { type: [String], default: [] },
    nextAppointment: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
