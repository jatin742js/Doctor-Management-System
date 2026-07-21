const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  date: Date,
  time: String,
  phone: String,
  address: String,
  reason: String,
  status: { type: String, default: "scheduled" },
  age: Number,
  gender: { type: String, default: "Male" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addedToPatients: { type: Boolean, default: false },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
