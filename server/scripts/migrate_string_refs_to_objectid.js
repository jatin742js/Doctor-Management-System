// Migration script: Convert string doctor/patient refs to ObjectId in reports and patients
const mongoose = require('mongoose');
const Report = require('../models/report');
const Patient = require('../models/patients');
const Doctor = require('../models/doctor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor_management';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Migrate Patient.doctor (string -> ObjectId)
  const patients = await Patient.find({});
  for (const patient of patients) {
    if (patient.doctor && typeof patient.doctor === 'string' && patient.doctor !== 'N/A') {
      const doctor = await Doctor.findOne({ name: patient.doctor, userId: patient.userId });
      if (doctor) {
        patient.doctor = doctor._id;
        await patient.save();
        console.log(`Updated patient ${patient.name}: doctor -> ${doctor.name}`);
      }
    }
  }

  // 2. Migrate Report.patient (string -> ObjectId)
  //    Migrate Report.doctor (string -> ObjectId)
  const reports = await Report.find({});
  for (const report of reports) {
    let updated = false;
    if (report.patient && typeof report.patient === 'string') {
      const patient = await Patient.findOne({ name: report.patient, userId: report.userId });
      if (patient) {
        report.patient = patient._id;
        updated = true;
      }
    }
    if (report.doctor && typeof report.doctor === 'string') {
      const doctor = await Doctor.findOne({ name: report.doctor, userId: report.userId });
      if (doctor) {
        report.doctor = doctor._id;
        updated = true;
      }
    }
    if (updated) {
      await report.save();
      console.log(`Updated report ${report.title}: patient/doctor refs`);
    }
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
