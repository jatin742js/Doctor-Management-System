const Prescription = require("../models/Prescription");

// 📌 Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const { date, diagnosis, medicalHistory, investigations, followUp, ...restData } = req.body;

    const newPrescription = new Prescription({
      ...restData,
      userId,
      date: date ? new Date(date) : new Date(),
      diagnosis: diagnosis || "",
      medicalHistory: medicalHistory || "",
      investigations: investigations || [],
      followUp: followUp ? new Date(followUp) : null,
    });

    await newPrescription.save();

    res.status(201).json({ success: true, message: "Prescription Saved", data: newPrescription });
  } catch (error) {
    console.error("Error saving prescription:", error);
    res.status(500).json({ success: false, message: "Error saving prescription", error });
  }
};

// 📌 Get all prescriptions for logged-in user
exports.getPrescriptions = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const prescriptions = await Prescription.find({ userId })
      .populate('patient')
      .populate('doctor')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ success: false, message: "Error fetching prescriptions", error });
  }
};

// 📌 Get single prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const prescription = await Prescription.findOne({ _id: req.params.id, userId })
      .populate('patient')
      .populate('doctor');
    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });

    res.json({ success: true, data: prescription });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.status(500).json({ success: false, message: "Error fetching prescription", error });
  }
};

// 📌 Update prescription
exports.updatePrescription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    )
      .populate('patient')
      .populate('doctor');

    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });

    res.json({ success: true, message: "Prescription updated", data: prescription });
  } catch (error) {
    console.error("Error updating prescription:", error);
    res.status(500).json({ success: false, message: "Error updating prescription", error });
  }
};

// 📌 Delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const deleted = await Prescription.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) return res.status(404).json({ success: false, message: "Prescription not found" });

    res.json({ success: true, message: "Prescription deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
};

// 📌 Get all unique medicine names for the logged-in user
exports.getMedicineNames = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const prescriptions = await Prescription.find({ userId });
    const medicineSet = new Set();

    // Collect medicine name + instruction (if present) so suggestions include instruction
    prescriptions.forEach((prescription) => {
      prescription.medicines.forEach((med) => {
        if (med.name) {
          const suggestion = med.instruction && med.instruction.trim()
            ? `${med.name} — ${med.instruction.trim()}`
            : med.name;
          medicineSet.add(suggestion);
        }
      });
    });

    res.json({ success: true, names: Array.from(medicineSet) });
  } catch (err) {
    console.error("Error fetching medicine names:", err);
    res.status(500).json({ success: false, message: "Error fetching medicine names", error: err });
  }
};

// 📌 Get all unique investigations for the logged-in user
exports.getInvestigations = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const prescriptions = await Prescription.find({ userId });
    const investigationsSet = new Set();

    prescriptions.forEach((prescription) => {
      if (prescription.investigations && Array.isArray(prescription.investigations)) {
        prescription.investigations.forEach((inv) => {
          if (inv) investigationsSet.add(inv);
        });
      }
    });

    res.json({ success: true, investigations: Array.from(investigationsSet) });
  } catch (err) {
    console.error("Error fetching investigations:", err);
    res.status(500).json({ success: false, message: "Error fetching investigations", error: err });
  }
};

// 📌 Get all unique diagnoses for the logged-in user
exports.getDiagnoses = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });

    const prescriptions = await Prescription.find({ userId });
    const diagnosesSet = new Set();

    prescriptions.forEach((prescription) => {
      if (prescription.diagnosis) {
        diagnosesSet.add(prescription.diagnosis);
      }
    });

    res.json({ success: true, diagnoses: Array.from(diagnosesSet) });
  } catch (err) {
    console.error("Error fetching diagnoses:", err);
    res.status(500).json({ success: false, message: "Error fetching diagnoses", error: err });
  }
};
