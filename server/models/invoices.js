const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  contact: { type: String },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  date: { type: Date, default: Date.now },
  services: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  todayPaidAmount: { type: Number, default: 0 }, // Payment made today only
  todayPaidDate: { type: Date }, // Date of today's payment (tracks which day the payment belongs to)
  nextDueAmount: { type: Number, default: 0 }, // Remaining balance
  paymentHistory: [
    {
      amount: { type: Number },
      date: { type: Date, default: Date.now },
      method: { type: String },
    },
  ], // Complete history of all payments
  status: { type: String, enum: ["Paid", "Partial", "Pending"], default: "Pending" },
  paymentMethod: { type: String, enum: ["Cash", "Card", "UPI", "Online", "Other"], default: "Cash" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Compound index: invoiceNumber + userId
invoiceSchema.index({ invoiceNumber: 1, userId: 1 }, { unique: true });

module.exports = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
