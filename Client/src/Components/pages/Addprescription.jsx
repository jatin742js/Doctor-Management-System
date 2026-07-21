import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreatePrescriptionMutation, useGetMedicineNamesQuery } from "../../store/services/prescriptionsApi";
import { useGetPatientsQuery } from "../../store/services/patientsApi";
import { useGetDoctorsQuery } from "../../store/services/doctorsApi";

export default function AddPrescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patient;

  const initialFormState = {
    patient: "",
    patientAge: "",
    patientGender: "",
    doctor: "",
    medicines: [{ name: "", frequency: "", duration: "", instruction: "" }],
    uid: "",
    // new fields
    medicalHistory: "",
    diagnosis: "",
   investigations: "",
 // repeatable investigation rows
    followUp: "", // could be date or text, kept as string to not force a UI change
    
  };

  const [form, setForm] = useState(initialFormState);
  const { data: medicineOptionsData } = useGetMedicineNamesQuery();
  const [createPrescription] = useCreatePrescriptionMutation();
  const medicineOptions = medicineOptionsData?.names || medicineOptionsData || [];
  // fetch full patients and doctors lists
  const { data: patientsData } = useGetPatientsQuery();
  const patients = patientsData?.patients || patientsData || [];
  const { data: doctorsData } = useGetDoctorsQuery();
  const doctors = doctorsData?.doctors || doctorsData || [];

  // Pre-fill patient if coming from patient page and generate UID
  useEffect(() => {
    if (patientData) {
      setForm((prev) => ({
        ...prev,
        patient: patientData._id || "",
      }));
    }
    generateUID();
  }, [patientData]);

  // no backend search; suggestions will be derived from `patients` on render

  // ✅ Fetch medicine names (JWT automatically included)
  // ...existing code...

  // Generate UID
  const generateUID = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let uid = "";
    for (let i = 0; i < 10; i++) {
      uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, uid }));
  };

  // No-op: patient/doctor handled by <select>


  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...form.medicines];
    updatedMedicines[index][field] = value;
    setForm({ ...form, medicines: updatedMedicines });
  };

  const addMedicine = () => {
    setForm({
      ...form,
      medicines: [...form.medicines, { name: "", frequency: "", duration: "" }],
    });
  };

  const removeMedicine = (index) => {
    if (form.medicines.length > 1) {
      const updatedMedicines = [...form.medicines];
      updatedMedicines.splice(index, 1);
      setForm({ ...form, medicines: updatedMedicines });
    }
  };

  // ✅ Save prescription (JWT auto sent)
  // Save prescription (RTK Query)
  const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createPrescription(form).unwrap();
      alert("Prescription saved ✅");
      setForm(initialFormState);
      generateUID();
      navigate("/prescriptions");
    } catch (err) {
      console.error("Error saving prescription:", err);
      alert("Failed to save prescription. Please try again.");
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-teal-100  flex justify-center items-start py-8 px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">PRESCRIPTION FORM</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Patient</label>
              <select
                value={form.patient}
                onChange={e => setForm(prev => ({ ...prev, patient: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 shadow-sm  rounded-lg text-sm"
                required
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} 
                  </option>
                ))}
              </select>
            </div>

             <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Age & Gender</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="patientAge"
                  value={form.patientAge}
                  onChange={handleChange}
                  required
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                  placeholder="Age"
                />
                <select
                  name="patientGender"
                  value={form.patientGender}
                  onChange={handleChange}
                  required
                  className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Doctor</label>
              <select
                value={form.doctor}
                onChange={e => setForm(prev => ({ ...prev, doctor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 shadow-sm rounded-lg text-sm"
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.specialization ? `(${d.specialization})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">UID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.uid}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                />
                <button
                  type="button"
                  onClick={generateUID}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Medical History */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">MEDICAL HISTORY</label>
              <input
                type="text"
                name="medicalHistory"
                value={form.medicalHistory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                placeholder="Enter patient's past medical history"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">DIAGNOSIS</label>
              <input
                type="text"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                placeholder="Enter diagnosis"
              />
            </div>




          {/* Medicines */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-semibold text-sm">MEDICINES(Rx)</label>
              <button
                type="button"
                onClick={addMedicine}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                + Add Medicine
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">#</th>
                    <th className="border px-2 py-1 text-left">Name</th>
                    <th className="border px-2 py-1 text-left">Frequency</th>
                    <th className="border px-2 py-1 text-left">Duration</th>
                    <th className="border px-2 py-1 text-left">Instruction</th>
                    <th className="border px-2 py-1 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.medicines.map((med, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{i + 1}</td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          list="medicineList"
                          value={med.name}
                          onChange={(e) => {
                            const val = e.target.value || "";
                            // If suggestion includes instruction (format: "Name — Instruction"), split it
                            if (val.includes(" — ")) {
                              const parts = val.split(" — ");
                              const namePart = parts.shift() || "";
                              const instrPart = parts.join(" — ") || "";
                              handleMedicineChange(i, "name", namePart);
                              handleMedicineChange(i, "instruction", instrPart);
                            } else {
                              handleMedicineChange(i, "name", val);
                            }
                          }}
                          className="w-full px-1 py-1 border-none focus:ring-0"
                          required
                        />
                        <datalist id="medicineList">
                          {medicineOptions.map((name, idx) => (
                            <option key={idx} value={name} />
                          ))}
                        </datalist>
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(i, "frequency", e.target.value)}
                          className="w-full px-1 py-1 border-none focus:ring-0"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(i, "duration", e.target.value)}
                          className="w-full px-1 py-1 border-none focus:ring-0"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={med.instruction || ""}
                          onChange={(e) => handleMedicineChange(i, "instruction", e.target.value)}
                          className="w-full px-1 py-1 border-none focus:ring-0"
                          placeholder=""
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeMedicine(i)}
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          
            {/* Investigations */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">INVESTIGATIONS ADVISED</label>
                <input
                  type="text"
                  name="investigations"
                  value={form.investigations}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                  placeholder="Enter investigations"
                />
              </div>

              {/* Follow Up*/}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">FOLLOW UP</label>
                  <input
                    type="date"
                    name="followUp"
                    value={form.followUp}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                  />
                </div>
                </div>


          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Save Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
