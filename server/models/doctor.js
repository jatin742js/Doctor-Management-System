const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  fee: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

// Compound unique index: email + userId (unique per clinic/user)
doctorSchema.index({ email: 1, userId: 1 }, { unique: true });

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
