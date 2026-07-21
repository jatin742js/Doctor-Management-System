const Appointment = require("../models/appointment");
const Patient = require("../models/patients");
const Doctor = require("../models/doctor");

// ✅ Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId })
      .populate({ path: "doctor", select: "name specialization" })
      .populate({ path: "patient", select: "name contact gender age" })
      .sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments", error: err.message });
  }
};

// ✅ Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      date: new Date(req.body.date),
      userId: req.user.userId,
      addedToPatients: false,
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: "Failed to save appointment", error: err.message });
  }
};

// ✅ Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const updated = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined },
      { new: true }
    )
      .populate({ path: "doctor", select: "name specialization" })
      .populate({ path: "patient", select: "name contact gender age" });

    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating appointment", error: err.message });
  }
};

// ✅ Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting appointment", error: err.message });
  }
};

// ✅ Add patient from appointment
exports.markAddedToPatients = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // If appointment.patient is already an ObjectId, just mark as added
    // Otherwise, create a new patient and update appointment.patient
    let patientId = appointment.patient;
    if (!patientId || typeof patientId === 'string') {
      const newPatient = new Patient({
        name: appointment.patient,
        contact: appointment.phone,
        doctor: appointment.doctor,
        address: appointment.address,
        history: appointment.reason,
        visiteddate: appointment.date,
        gender: appointment.gender,
        age: appointment.age,
        userId: req.user.userId,
      });
      await newPatient.save();
      appointment.patient = newPatient._id;
      patientId = newPatient._id;
    }
    appointment.addedToPatients = true;
    await appointment.save();
    res.status(201).json({ success: true, patient: patientId, appointment });
  } catch (err) {
    res.status(500).json({ message: "Failed to add patient from appointment", error: err.message });
  }
};
