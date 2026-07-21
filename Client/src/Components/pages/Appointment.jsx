import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAppointmentsQuery,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useAddPatientToAppointmentMutation,
} from "../../store/services/appointmentsApi";
import { useGetDoctorsQuery } from "../../store/services/doctorsApi";
import { useGetPatientsQuery } from "../../store/services/patientsApi";
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// =======================================================
// ✅ Clinic Appointments Component
// =======================================================
const Appointments = () => {
  const navigate = useNavigate();

  // =======================================================
  // ✅ State Variables
  // =======================================================
  // RTK Query hooks
  const { data: appointments = [], isLoading: appointmentsLoading, refetch } = useGetAppointmentsQuery();
  const [updateAppointment] = useUpdateAppointmentMutation();
  const [deleteAppointmentMutation] = useDeleteAppointmentMutation();
  const [addPatientToAppointmentMutation] = useAddPatientToAppointmentMutation();
  const { data: doctors = [] } = useGetDoctorsQuery();
  const { data: patientsData = [] } = useGetPatientsQuery();
  const patients = patientsData?.patients || patientsData || [];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormValues, setEditFormValues] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  // local loading removed; use appointmentsLoading from RTK Query

  // =======================================================
  // ✅ Check Token and Redirect
  // =======================================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // =======================================================
  // ✅ Utility: Format Date YYYY-MM-DD
  // =======================================================
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // =======================================================
  // ✅ Helper and auth error handler
  // =======================================================
  // auth helpers removed; navigation on missing token handled in useEffect above

  // No need for fetchAppointments/fetchDoctors, RTK Query handles fetching

  // =======================================================
  // ✅ Calendar Functions
  // =======================================================
  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const goToPreviousMonth = () =>
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () =>
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const selectedFullDate = formatDate(selectedDate);

  // =======================================================
  // ✅ Filter Appointments
  // =======================================================
  // Filter appointments by patient/doctor name (populated object)
  const filteredAppointments = (appointments || []).filter((app) => {
    const appDate = app.date ? formatDate(app.date) : null;
    const matchesDate = appDate === selectedFullDate;
    const patientName = app.patient?.name || "";
    const doctorName = app.doctor?.name || "";
    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  // =======================================================
  // ✅ Appointment Handlers
  // =======================================================
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await deleteAppointmentMutation(id);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to delete appointment.");
    }
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setEditFormValues({
      patient: appointment.patient?._id || appointment.patient || "",
      doctor: appointment.doctor?._id || appointment.doctor || "",
      date: appointment.date ? formatDate(appointment.date) : "",
      time: appointment.time || "",
      phone: appointment.phone || "",
      address: appointment.address || "",
      reason: appointment.reason || "",
      status: appointment.status || "scheduled",
      age: appointment.age || "",
      gender: appointment.gender || "Male",
    });
    setShowEditModal(true);
  };

  const saveEditedAppointment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editFormValues,
        doctor: editFormValues.doctor,
        patient: editFormValues.patient,
      };
      await updateAppointment({ id: editingAppointment._id, body: payload });
      refetch();
      setShowEditModal(false);
      setEditingAppointment(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment.");
    }
  };

  const handleAddPatient = async (app) => {
    try {
      await addPatientToAppointmentMutation({ id: app._id });
      refetch();
      navigate("/patients");
    } catch (err) {
      console.error(err);
      alert("Failed to add patient to appointment.");
    }
  };

  const handleReAppointment = (app) => {
    navigate("/appointments/add", { state: { reappointment: app } });
  };

  // =======================================================
  // ✅ Render JSX
  // =======================================================
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 md:p-8  bg-gradient-to-br from-green-50 to-teal-100 ">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
          🏥 Clinic Appointment Scheduler
        </h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">
          Manage all your patient appointments efficiently
        </p>
      </div>

      {/* Main Container */}
      <div className="appointments-container max-w-7xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Calendar Section */}
        <div className="calendar-section w-full lg:w-1/3 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gradient-to-b from-blue-600 to-indigo-700 text-white flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30"
            >
              ←
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-center">
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button
              type="button"
              onClick={goToNextMonth}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-6 text-sm sm:text-base">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div key={day} className="text-xs font-semibold text-blue-200 tracking-wide">
                {day}
              </div>
            ))}
            {(() => {
              const year = selectedDate.getFullYear();
              const month = selectedDate.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const totalDays = new Date(year, month + 1, 0).getDate();
              const daysArray = [];
              for (let i = 0; i < firstDay; i++) daysArray.push(<div key={`empty-${i}`} />);
              for (let d = 1; d <= totalDays; d++) {
                daysArray.push(
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDate(new Date(year, month, d))}
                    className={`flex items-center justify-center aspect-square rounded-xl font-bold transition-all duration-200 text-sm sm:text-base
                      ${selectedDate.getDate() === d ? "bg-white text-blue-700 shadow-lg" : "text-white hover:bg-blue-500/40"}`}
                  >
                    {d}
                  </button>
                );
              }
              return daysArray;
            })()}
          </div>

          <button
            type="button"
            onClick={() => navigate("/appointments/add")}
            className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 py-3 px-6 rounded-xl font-semibold shadow-lg hover:bg-blue-50 transition"
          >
            <PlusCircleIcon className="w-5 h-5" /> Add Appointment
          </button>
        </div>

        {/* Appointments List */}
        <div className="appointments-list w-full lg:w-2/3 p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" /> Appointments
            </h2>
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Appointment Cards */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-260px)] pr-2">
            {appointmentsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading appointments...</div>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((app) => (
                <div key={app._id} className="bg-white rounded-xl p-5 sm:p-6 shadow hover:shadow-lg transition border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-blue-500" /> {app.patient?.name || app.patient || "Unnamed Patient"}
                      </h3>
                      <p className="text-sm text-gray-500">{formatDate(app.date)} at {app.time}</p>
                      <p className="text-sm text-gray-600">🩺 Doctor: {app.doctor?.name || "Not Assigned"}</p>
                      <p className="text-sm text-gray-600">📞 {app.phone || "No contact"}</p>
                      <p className="text-sm text-gray-600">🎂 Age: {app.age || "N/A"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <button onClick={() => toggleExpand(app._id)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                        <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                      </button>
                      <button onClick={() => openEditModal(app)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200">
                        <PencilSquareIcon className="w-5 h-5 text-blue-600" />
                      </button>
                      <button onClick={() => handleDeleteAppointment(app._id)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200">
                        <TrashIcon className="w-5 h-5 text-red-600" />
                      </button>
                      <button onClick={() => handleReAppointment(app)} className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600">
                        Re-Appointment
                      </button>
                      <button
                        onClick={() => handleAddPatient(app)}
                        disabled={app.addedToPatients}
                        className={`p-2 rounded-lg ${
                          app.addedToPatients ? "bg-green-100 text-green-600 cursor-not-allowed" : "bg-yellow-100 hover:bg-yellow-200 text-yellow-600"
                        }`}
                      >
                        {app.addedToPatients ? "Added" : "Add Patient"}
                      </button>
                    </div>
                  </div>

                  {expanded[app._id] && (
                    <div className="mt-4 text-sm text-gray-700 border-t pt-3">
                      <p><strong>Address:</strong> {app.address || "N/A"}</p>
                      <p><strong>Reason:</strong> {app.reason || "N/A"}</p>
                      <p><strong>Status:</strong> {app.status || "Scheduled"}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 border-2  rounded-xl">
                No appointments found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-auto">
          <form onSubmit={saveEditedAppointment} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Appointment</h2>
            <select
              value={editFormValues.patient || ""}
              onChange={(e) => setEditFormValues((prev) => ({ ...prev, patient: e.target.value }))}
              className="w-full border px-3 py-2 rounded-lg text-sm sm:text-base"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} 
                </option>
              ))}
            </select>
            <select
              value={editFormValues.doctor || ""}
              onChange={(e) => setEditFormValues((prev) => ({ ...prev, doctor: e.target.value }))}
              className="w-full border px-3 py-2 rounded-lg text-sm sm:text-base"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                </option>
              ))}
            </select>
            {['date', 'time', 'phone', 'address', 'reason', 'age'].map((field) => (
              <input
                key={field}
                type={field === 'date' ? 'date' : field === 'age' ? 'number' : 'text'}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={editFormValues[field] || ""}
                onChange={(e) => setEditFormValues((prev) => ({ ...prev, [field]: e.target.value }))}
                className="w-full border px-3 py-2 rounded-lg text-sm sm:text-base"
              />
            ))}
            <select
              value={editFormValues.status || "scheduled"}
              onChange={(e) => setEditFormValues((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full border px-3 py-2 rounded-lg text-sm sm:text-base"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Save
              </button>
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 w-full border py-2 rounded-lg hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Appointments;
