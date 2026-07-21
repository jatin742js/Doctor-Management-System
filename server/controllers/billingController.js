const Invoice = require("../models/invoices");
const Doctor = require("../models/doctor");
const Patient = require("../models/patients");

// =======================================================
// ✅ Get all invoices for the logged-in user (JWT version)
// =======================================================
exports.getInvoices = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const invoices = await Invoice.find({ userId })
      .populate({ path: 'patient', select: 'name contact gender age' })
      .populate({ path: 'doctor', select: 'name specialization' })
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ message: "Error fetching invoices", error: err.message });
  }
};

// =======================================================
// ✅ Get invoice by ID
// =======================================================
exports.getInvoiceById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const invoice = await Invoice.findOne({ _id: req.params.id, userId })
      .populate({ path: 'patient', select: 'name contact gender age' })
      .populate({ path: 'doctor', select: 'name specialization' });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json(invoice);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ message: "Error fetching invoice", error: err.message });
  }
};

// =======================================================
// ✅ Create new invoice (auto contact + random invoiceNumber)
// =======================================================
exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Generate random invoice number
    const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
    const invoiceNumber = `INV-${randomString}`;

    let { patient, contact, doctor, amount, paidAmount = 0, ...rest } = req.body;

    // ensure numeric values
    amount = Number(amount) || 0;
    paidAmount = Number(paidAmount) || 0;

    // derive status from paidAmount
    let status = "Pending";
    if (paidAmount >= amount && amount > 0) status = "Paid";
    else if (paidAmount > 0) status = "Partial";

    const invoice = new Invoice({
      ...rest,
      patient,
      contact: contact || "",
      doctor,
      amount,
      paidAmount,
      todayPaidAmount: paidAmount > 0 ? paidAmount : 0, // If initial payment, set as today's payment
      todayPaidDate: paidAmount > 0 ? new Date() : null,
      nextDueAmount: amount - paidAmount, // Remaining balance
      paymentHistory: paidAmount > 0 ? [{ amount: paidAmount, date: new Date(), method: rest.paymentMethod || "Cash" }] : [],
      status,
      invoiceNumber,
      userId,
    });

    const savedInvoice = await invoice.save();
    await savedInvoice.populate({ path: 'patient', select: 'name contact gender age' });
    await savedInvoice.populate({ path: 'doctor', select: 'name specialization' });
    res.status(201).json(savedInvoice);
  } catch (err) {
    console.error("Error creating invoice:", err);
    if (err.code === 11000 && err.keyPattern?.invoiceNumber && err.keyPattern?.userId) {
      return res.status(400).json({ message: "Invoice number already exists for this clinic" });
    }
    res.status(500).json({ message: "Error creating invoice", error: err.message });
  }
};

// =======================================================
// ✅ Update invoice (auto re-fetch contact)
// =======================================================
exports.updateInvoice = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const invoice = await Invoice.findOne({ _id: req.params.id, userId });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // prefer explicit paidAmount from body, otherwise keep existing
    let { patient, contact, doctor, amount, paidAmount, ...rest } = req.body;

    // normalize numeric fields
    amount = amount !== undefined ? Number(amount) : invoice.amount;
    paidAmount = paidAmount !== undefined ? Number(paidAmount) : invoice.paidAmount || 0;

    // derive status (body `status` takes precedence if provided)
    let status = req.body.status || "Pending";
    if (!req.body.status) {
      if (paidAmount >= amount && amount > 0) status = "Paid";
      else if (paidAmount > 0) status = "Partial";
      else status = "Pending";
    }

    // Auto-fetch contact if missing
    if ((!contact || contact.trim() === "") && patientName) {
      const patient = await Patient.findOne({ name: patientName, userId }).select("contact");
      if (patient && patient.contact) contact = patient.contact;
    }

    // Calculate payment delta to update today's payment tracking
    const previousPaidAmount = invoice.paidAmount || 0;
    const deltaPayment = paidAmount - previousPaidAmount;

    // Get today's date boundaries
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Check if invoice's todayPaidDate is from today
    const isSameDayAsLastPayment = invoice.todayPaidDate && 
      invoice.todayPaidDate >= startOfToday && 
      invoice.todayPaidDate <= endOfToday;

    // Update today's payment fields based on delta
    let updatedTodayPaidAmount = invoice.todayPaidAmount || 0;
    let updatedTodayPaidDate = invoice.todayPaidDate;

    if (deltaPayment > 0) {
      if (isSameDayAsLastPayment) {
        // Same day: accumulate to today's payment
        updatedTodayPaidAmount += deltaPayment;
      } else {
        // Different day: reset today's payment to just the delta
        updatedTodayPaidAmount = deltaPayment;
        updatedTodayPaidDate = new Date();
      }
    }

    // Update payment history
    const updatedPaymentHistory = invoice.paymentHistory ? [...invoice.paymentHistory] : [];
    if (deltaPayment !== 0) {
      updatedPaymentHistory.push({
        amount: deltaPayment,
        date: new Date(),
        method: rest.paymentMethod || invoice.paymentMethod || "Cash",
      });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        patient,
        contact: contact || "",
        doctor,
        amount,
        paidAmount,
        todayPaidAmount: updatedTodayPaidAmount,
        todayPaidDate: updatedTodayPaidDate,
        nextDueAmount: amount - paidAmount,
        paymentHistory: updatedPaymentHistory,
        status,
      },
      { new: true, runValidators: true }
    )
      .populate({ path: 'patient', select: 'name contact gender age' })
      .populate({ path: 'doctor', select: 'name specialization' });

    res.status(200).json(updatedInvoice);
  } catch (err) {
    console.error("Error updating invoice:", err);
    if (err.code === 11000 && err.keyPattern?.invoiceNumber && err.keyPattern?.userId) {
      return res.status(400).json({ message: "Invoice number already exists for this clinic" });
    }
    res.status(500).json({ message: "Error updating invoice", error: err.message });
  }
};

// =======================================================
// ✅ Delete invoice
// =======================================================
exports.deleteInvoice = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Invoice.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    res.status(500).json({ message: "Error deleting invoice", error: err.message });
  }
};
