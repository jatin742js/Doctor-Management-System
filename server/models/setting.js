// models/setting.js
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  clinicName: { type: String, required: true },
  logo: { type: String }, // file path or url
  address: { type: String },
  phone: { type: String },
  email: { type: String },

  workingHours: {
    open: { type: String }, // e.g. "09:00"
    close: { type: String } // e.g. "18:00"
  },

  appointment: {
    slotDuration: { type: Number, default: 30 }, // in minutes
    maxPatientsPerDay: { type: Number, default: 50 }
  },

  billing: {
    currency: { type: String, default: "INR" },
    taxPercent: { type: Number, default: 0 },
    invoicePrefix: { type: String, default: "INV-" }
  },

  notification: {
    enableSMS: { type: Boolean, default: false },
    enableEmail: { type: Boolean, default: true },
    reminderBefore: { type: Number, default: 24 } // in hours
  },

  theme: {
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: "en" }
  },

  updatedAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }

});

module.exports = mongoose.model("Setting", settingSchema);
