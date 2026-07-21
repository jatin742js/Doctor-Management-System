const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instruction: { type: String, default: "" }
});

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  uid: { 
    type: String, 
    required: true, 
    default: () => Math.random().toString(36).substr(2, 10).toUpperCase() 
  },
  date: { type: Date, required: true, default: Date.now },
  medicines: { type: [medicineSchema], default: [] },
  diagnosis: { type: String, default: "" },
  medicalHistory: { type: String, default: "" },
  investigations: { type: [String], default: [] },
  followUp: { type: Date, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
}, {timestamps: true});

module.exports = mongoose.model("Prescription", prescriptionSchema);
