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
  const [createPatient, { isLoading }] = useCreatePatientMutation();
  // fetch doctors for select
  const { data: doctorsData, isLoading: isDoctorsLoading } = useGetDoctorsQuery();
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
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-slate-100 bg-white px-6 py-5 sm:px-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </span>
              <h1 className="text-xl font-bold text-slate-800">New Patient Registration</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Register a new patient profile into the electronic medical record system.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
          >
            ← Back to Patient List
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Guidelines Sidebar */}
          <div className="lg:col-span-4 bg-slate-50/60 p-6 sm:p-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-3">
              Registration Guidelines
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Ensure high data accuracy to maintain seamless medical care continuity across departments.
            </p>
            <ul className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Fields marked with <span className="text-red-500 font-medium">*</span> are required for patient intake.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Double check contact numbers for SMS/appointment reminders.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Log known drug allergies or pre-existing conditions in the history section.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-teal-600 font-bold">•</span>
                <span>Assign primary attending physician if appointment is scheduled today.</span>
              </li>
            </ul>

            <div className="mt-8 p-3.5 bg-teal-50/80 border border-teal-100 rounded-xl text-teal-900 text-xs">
              <p className="font-semibold mb-0.5">Confidentiality Note</p>
              <p className="text-teal-700 leading-normal">
                Patient information is protected under HIPAA / healthcare privacy compliance.
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-8 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Section 1: Basic Info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  1. General Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Jane Doe"
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={form.contact}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        handleChange({ target: { name: "contact", value: val } });
                      }}
                      placeholder="10-digit mobile number"
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                  </div>

                  {/* Email (Kept state preserved) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="patient@example.com"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="e.g. 34"
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street address, city, state"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 2: Clinical Details */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  2. Visit Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Visited Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Visit Date
                    </label>
                    <input
                      type="date"
                      name="visiteddate"
                      value={form.visiteddate}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                  </div>

                  {/* Attending Doctor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Doctor
                    </label>
                    <select
                      name="doctor"
                      value={form.doctor}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    >
                      <option value="">
                        {isDoctorsLoading ? "Loading doctors..." : "Select doctor (optional)"}
                      </option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          Dr. {d.name} {d.specialization ? `— ${d.specialization}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Patient Status */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Status
                    </label>
                    <div className="flex gap-4 items-center pt-1">
                      {["Active", "Inactive"].map((statusOption) => (
                        <label key={statusOption} className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={statusOption}
                            checked={form.status === statusOption}
                            onChange={handleChange}
                            className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                          />
                          {statusOption}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Medical History / Notes
                    </label>
                    <textarea
                      name="history"
                      value={form.history}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter known allergies, chronic illnesses, current medications..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 active:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 active:bg-teal-800 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <span>Save Patient Record</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}