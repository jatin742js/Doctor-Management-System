import React, { useState, useEffect } from "react";
import { useGetDoctorsQuery } from "../../store/services/doctorsApi";
import { useGetPatientsQuery } from "../../store/services/patientsApi";
import { useCreateAppointmentMutation } from "../../store/services/appointmentsApi";
import { useLocation, useNavigate } from "react-router-dom";

// Reusable input component
const InputWithIcon = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
  options = [],
}) => (
  <div className="relative w-full">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500 ml-1 text-xs">(Required)</span>}
    </label>

    {type === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none shadow-sm bg-white text-sm sm:text-base"
        required={required}
      >
        <option value="" disabled hidden>
          {placeholder || "Select"}
        </option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none shadow-sm bg-white resize-none min-h-[100px] text-sm sm:text-base"
        placeholder={placeholder}
        required={required}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none shadow-sm bg-white text-sm sm:text-base"
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
);

export default function AddAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const reappointment = location.state?.reappointment || null;

  const [form, setForm] = useState({
    patient: "",
    age: "",
    gender: "Male",
    doctor: "",
    date: "",
    time: "",
    address: "",
    phone: "",
    reason: "",
    status: "scheduled",
  });

  // RTK Query hooks
  const { data: doctorsData, error: doctorsError } = useGetDoctorsQuery();
  const { data: patientsData, error: patientsError } = useGetPatientsQuery();
  const [createAppointment, { error: createError }] = useCreateAppointmentMutation();

  // Extract doctors and patients arrays
  const doctors = doctorsData?.doctors || doctorsData || [];
  const patients = patientsData?.patients || patientsData || [];

  const selectOptions = {
    gender: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Other", label: "Other" },
    ],
    status: [
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Prefill form for re-appointment
  useEffect(() => {
    if (reappointment) {
      setForm({
        patient: reappointment.patient?._id || reappointment.patient || "",
        age: reappointment.age || "",
        gender: reappointment.gender || "Male",
        doctor: reappointment.doctor?._id || "",
        date: "",
        time: "",
        address: reappointment.address || "",
        phone: reappointment.phone || "",
        reason: reappointment.reason || "",
        status: "scheduled",
      });
    }
  }, [reappointment]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      await createAppointment(form).unwrap();
      alert(
        reappointment
          ? "Re-Appointment booked successfully!"
          : "Appointment booked successfully!"
      );
      navigate("/appointments");
    } catch (err) {
      console.error("Error saving appointment:", err?.data || err?.message || err);
      alert(err?.data?.message || err?.error || "Failed to save appointment. Check backend.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6  bg-gradient-to-br from-green-50 to-teal-100 ">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100">
        {reappointment && (
          <div className="mb-6 p-4 bg-indigo-100 border border-indigo-300 text-indigo-700 rounded-xl text-center font-semibold">
              🩺 Re-Appointment for{" "}
              <span className="font-bold text-indigo-800">{reappointment.patient?.name || reappointment.patient}</span>
            </div>
        )}

        <header className="text-center mb-6 sm:mb-8 pb-4 border-b border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {reappointment ? "Book Re-Appointment" : "Book New Appointment"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {reappointment
              ? "This appointment will be linked to an existing patient."
              : "Fill in the form below to schedule an appointment."}
          </p>
        </header>



        {/* Loading and error states for doctors/patients */}
        {(!doctorsData || !patientsData) && (
          <div className="text-center text-blue-500 font-semibold mb-4">Loading doctors and patients...</div>
        )}
        {(doctorsError || patientsError) && (
          <div className="text-center text-red-500 font-semibold mb-4">
            Error loading doctors or patients. Please try again.
          </div>
        )}
        {createError && (
          <div className="text-center text-red-500 font-semibold mb-4">
            Error creating appointment: {createError.data?.message || createError.error || "Unknown error"}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Patient Info */}
            <div className="space-y-5 bg-blue-50 p-5 sm:p-6 rounded-2xl border border-blue-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Patient Information</h2>

              {/* Patient select */}
              <div className="relative">
                <InputWithIcon
                  label="Patient"
                  name="patient"
                  type="select"
                  value={form.patient}
                  onChange={(e) => {
                    // set patient id and also prefill some fields
                    handleChange(e);
                    const pid = e.target.value;
                    const p = patients.find((x) => x._id === pid);
                    if (p) {
                      setForm((prev) => ({
                        ...prev,
                        age: p.age || prev.age,
                        gender: p.gender || prev.gender,
                        phone: p.phone || prev.phone,
                        address: p.address || prev.address,
                      }));
                    }
                    
                  }}
                  placeholder="Select patient"
                  required={!reappointment}
                  options={patients.map((p) => ({ value: p._id, label: p.name }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithIcon
                  label="Age"
                  name="age"
                  type="number"
                  value={form.age}
                  onChange={handleChange}
                  required={!reappointment}
                />
                <InputWithIcon
                  label="Gender"
                  name="gender"
                  type="select"
                  value={form.gender}
                  onChange={handleChange}
                  options={selectOptions.gender}
                  required={!reappointment}
                />
              </div>
              <InputWithIcon
  label="Phone"
  name="phone"
  type="text"    // ← type="tel" ya "number" mat use karo, control mushkil hota hai
  value={form.phone}
  onChange={(e) => {
    let val = e.target.value;

    // ❗ Sirf numbers allow
    val = val.replace(/\D/g, "");

    // ❗ Maximum 10 digits
    val = val.slice(0, 10);

    handleChange({
      target: { name: "phone", value: val }
    });
  }}
  placeholder="1234567890"
  required={!reappointment}
/>

            </div>

            {/* Appointment Details */}
            <div className="space-y-5 bg-green-50 p-5 sm:p-6 rounded-2xl border border-green-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Appointment Details</h2>
              <InputWithIcon
                label="Doctor"
                name="doctor"
                type="select"
                value={form.doctor}
                onChange={handleChange}
                options={doctors.map((d) => ({
                  value: d._id,
                  label: `${d.name} (${d.specialization || "General"})`,
                }))}
                required={!reappointment}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputWithIcon
                  label="Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
                <InputWithIcon
                  label="Time"
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
              <InputWithIcon
                label="Reason"
                name="reason"
                type="textarea"
                value={form.reason}
                onChange={handleChange}
                placeholder="Reason for visit"
                required
              />
              <InputWithIcon
                label="Status"
                name="status"
                type="select"
                value={form.status}
                onChange={handleChange}
                options={selectOptions.status}
                required
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-purple-50 p-5 sm:p-6 rounded-2xl border border-purple-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
            <InputWithIcon
              label="Address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Street, City"
              required={!reappointment}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-blue-600 transition-all duration-200 text-sm sm:text-base"
            >
              {reappointment ? "Confirm Re-Appointment" : "Confirm Appointment"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/appointments")}
              className="flex-1 border py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
