const Doctor = require("../models/doctor");

// =======================================================
// ✅ Get all doctors for logged-in user
// =======================================================
exports.getDoctors = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ FIXED
    const doctors = await Doctor.find({ userId });
    res.json(doctors);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ error: "Error fetching doctors" });
  }
};

// =======================================================
// ✅ Add new doctor
// =======================================================
exports.postAddDoctor = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, specialization, contact, email, fee, isActive } = req.body;

    const doctor = new Doctor({
      name,
      specialization,
      contact,
      email,
      fee,
      isActive: isActive !== undefined ? isActive : true,
      userId, // ✅ associate doctor with logged-in user
    });

    const savedDoctor = await doctor.save();
    res.status(201).json(savedDoctor);
  } catch (err) {
    console.error("Error adding doctor:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists for this clinic" });
    }
    res.status(500).json({ error: "Error adding doctor", message: err.message });
  }
};

// =======================================================
// ✅ Update doctor
// =======================================================
exports.updateDoctor = async (req, res) => {
  try {
    const userId = req.user.userId;

    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(doctor);
  } catch (err) {
    console.error("Error updating doctor:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists for this clinic" });
    }
    res.status(500).json({ error: "Error updating doctor" });
  }
};

// =======================================================
// ✅ Delete doctor
// =======================================================
exports.deleteDoctor = async (req, res) => {
  try {
    const userId = req.user.userId;
    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, userId });

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("Error deleting doctor:", err);
    res.status(500).json({ error: "Error deleting doctor" });
  }
};

// =======================================================
// ✅ Search doctors (for dropdown/autocomplete)
// =======================================================
exports.searchDoctors = async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = req.query.name || "";

    const doctors = await Doctor.find({
      userId,
      name: { $regex: query, $options: "i" },
    }).select("_id name specialization");

    res.status(200).json(doctors);
  } catch (err) {
    console.error("Error searching doctors:", err);
    res.status(500).json({ error: "Error searching doctors" });
  }
};
