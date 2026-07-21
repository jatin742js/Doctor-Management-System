import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePatientMutation } from "../../store/services/patientsApi";
import { useGetDoctorsQuery } from "../../store/services/doctorsApi";

export default function AddPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    gender: "",
    age: "",
    visiteddate: "",
    address: "",
  doctor: "",
    status: "Active",
    history: "",
  });
  const [createPatient] = useCreatePatientMutation();
  // fetch doctors for select
  const { data: doctorsData } = useGetDoctorsQuery();
  const doctors = doctorsData?.doctors || doctorsData || [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createPatient(form).unwrap();
      alert(res.message || "✅ Patient saved successfully!");
      navigate("/patients");
    } catch (error) {
      if (error?.data?.error) {
        alert(error.data.error);
      } else if (error?.status === 401) {
        alert("❌ Unauthorized! Please login again.");
        navigate("/login");
      } else {
        alert("❌ Failed to save patient. Please try again.");
      }
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100  flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 w-full">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Patient Registration
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Complete the form below to register a new patient in the system
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 bg-gradient-to-b from-blue-600 to-indigo-700 text-white p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 border-b border-blue-400 pb-2">
                Guidelines
              </h2>
              <ul className="text-blue-100 text-sm space-y-3 leading-relaxed">
                <li>🩺 Fill in all required (*) fields carefully.</li>
                <li>📞 Ensure contact details are correct.</li>
                <li>📋 Mention past medical history for better diagnosis.</li>
                <li>👨‍⚕️ Assign a doctor if applicable.</li>
                <li>💾 Review details before saving.</li>
              </ul>
            </div>

            {/* Form Section */}
            <div className="w-full md:w-2/3 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Patient Age
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        required
                        className="w-3/3 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact <span className="text-red-500">*</span>
                    </label>
                    <input
  type="text"
  name="contact"
  value={form.contact}
  onChange={(e) => {
    let val = e.target.value;

    // ❗ Sirf numbers allow
    val = val.replace(/\D/g, "");

    // ❗ Max 10 digits
    val = val.slice(0, 10);

    handleChange({
      target: { name: "contact", value: val }
    });
  }}
  placeholder="Enter contact number"
  required
  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
/>

                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Visited Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visited Date
                    </label>
                    <input
                      type="date"
                      name="visiteddate"
                      value={form.visiteddate}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Doctor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor
                    </label>
                    <select
                      name="doctor"
                      value={form.doctor}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select doctor (optional)</option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} {d.specialization ? `(${d.specialization})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Medical History */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical History
                    </label>
                    <textarea
                      name="history"
                      value={form.history}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Any allergies or past conditions..."
                      className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Buttons */}
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
                    className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
                  >
                    Save Patient Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}