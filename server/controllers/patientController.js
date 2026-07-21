const Patient = require("../models/patients");

// Get all patients (user-specific)
exports.getPatientsJSON = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const patients = await Patient.find({ userId })
      .populate({ path: 'doctor', select: 'name specialization' })
      .sort({ visiteddate: -1 });
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add a new patient
exports.postAddPatientJSON = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      name, contact, gender, age, address, doctor, status,
      history, medicines, visiteddate, nextAppointment
    } = req.body;

    const newPatient = await Patient.create({
      name,
      contact,
      gender,
      age: age ? Number(age) : null,
      address,
      doctor,
      status: status || "Active",
      history: history || "",
      medicines: medicines || [],
      visiteddate: visiteddate ? new Date(visiteddate) : new Date(),
      nextAppointment: nextAppointment ? new Date(nextAppointment) : null,
      userId,
    });
    await newPatient.populate({ path: 'doctor', select: 'name specialization' });
    res.status(201).json({ message: "Patient added successfully", patient: newPatient });
  } catch (err) {
    console.error("Error adding patient:", err);
    res.status(500).json({ error: "Failed to add patient" });
  }
};

// Update patient
exports.updatePatientJSON = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const updateData = { ...req.body };
    if (updateData.visiteddate) updateData.visiteddate = new Date(updateData.visiteddate);
    if (updateData.nextAppointment) updateData.nextAppointment = new Date(updateData.nextAppointment);

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true }
    ).populate({ path: 'doctor', select: 'name specialization' });

    if (!patient) return res.status(404).json({ error: "Patient not found or unauthorized" });
    res.json({ message: "Patient updated successfully", patient });
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({ error: "Failed to update patient" });
  }
};

// Delete patient
exports.deletePatientJSON = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const patient = await Patient.findOneAndDelete({ _id: req.params.id, userId });
    if (!patient) return res.status(404).json({ error: "Patient not found or unauthorized" });

    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error("Error deleting patient:", err);
    res.status(500).json({ error: "Failed to delete patient" });
  }
};

// Search patients by name
exports.searchPatients = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.query;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!name || name.trim().length < 1) return res.json([]);

    const patients = await Patient.find({
      userId,
      name: { $regex: name, $options: "i" },
    })
      .limit(10)
      .select("name contact gender age address doctor")
      .populate({ path: 'doctor', select: 'name specialization' });

    res.json(patients);
  } catch (err) {
    console.error("Error searching patients:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single patient by ID
exports.getPatientByIdJSON = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const patient = await Patient.findOne({ _id: req.params.id, userId })
      .populate({ path: 'doctor', select: 'name specialization' });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ error: "Server error" });
  }
};
