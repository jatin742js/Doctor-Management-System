import React, { useState } from "react";
import {
  useGetPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} from "../../store/services/patientsApi";
import { useGetPrescriptionsQuery } from "../../store/services/prescriptionsApi";
import { useNavigate } from "react-router-dom";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  UserCircleIcon,
  PhoneIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  DocumentPlusIcon,
  BuildingOffice2Icon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Patients = () => {
  const navigate = useNavigate();
  // RTK Query: fetch patients
  const { data: patients = [], refetch } = useGetPatientsQuery();
  const { data: prescriptionsData = [] } = useGetPrescriptionsQuery();
  const [createPatient] = useCreatePatientMutation();
  const [updatePatient] = useUpdatePatientMutation();
  const [deletePatient] = useDeletePatientMutation();
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientFormValues, setPatientFormValues] = useState({});
  const [showPatientDeleteModal, setShowPatientDeleteModal] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionDateFilter, setPrescriptionDateFilter] = useState("");

  // No need for fetchPatients, RTK Query handles fetching

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      patient.contact?.includes(patientSearchQuery) ||
      patient.address?.toLowerCase().includes(patientSearchQuery.toLowerCase())
  );

  const openPatientForm = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setPatientFormValues({ ...patient });
    } else {
      setEditingPatient(null);
      setPatientFormValues({
        name: "",
        age: "",
        gender: "",
        contact: "",
        email: "",
        address: "",
        history: "",
        medicines: [],
      });
    }
    setShowPatientForm(true);
  };

  const confirmPatientDelete = (id) => {
    setDeletePatientId(id);
    setShowPatientDeleteModal(true);
  };

  const handleDeletePatient = async () => {
    try {
      await deletePatient(deletePatientId);
      refetch();
      setShowPatientDeleteModal(false);
      setDeletePatientId(null);
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient.");
    }
  };

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
  };

  const closePatientDetails = () => {
    setSelectedPatient(null);
    setPrescriptionDateFilter("");
  };

  const savePatient = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await updatePatient({ id: editingPatient._id, body: patientFormValues });
        alert("✅ Patient updated successfully!");
      } else {
        await createPatient(patientFormValues);
        alert("✅ Patient added successfully!");
      }
      refetch();
      setShowPatientForm(false);
    } catch (err) {
      console.error("Error saving patient:", err);
      alert("❌ Failed to save patient");
    }
  };

  // Group patients by visit date
  const groupedPatients = filteredPatients.reduce((acc, patient) => {
    const date = patient.visiteddate
      ? new Date(patient.visiteddate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Registration / Unspecified Date";
    if (!acc[date]) acc[date] = [];
    acc[date].push(patient);
    return acc;
  }, {});

 return (
    <div className="min-h-screen w-full bg-slate-50/60 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>🩺</span> Patient Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Centralized medical records, patient history, and prescription logs
            </p>
          </div>

          <button
            onClick={() => navigate("/patients/add")}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Register New Patient</span>
          </button>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{patients.length}</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtered Results</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{filteredPatients.length}</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prescriptions Issued</p>
              <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                {(prescriptionsData?.data || []).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <ClipboardDocumentListIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by patient name, phone, address..."
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>

            <p className="text-xs text-slate-400 self-end sm:self-center">
              Displaying <span className="font-semibold text-slate-700">{filteredPatients.length}</span> records
            </p>
          </div>
        </div>

        {/* Grouped Patient Records */}
        <div className="space-y-6">
          {Object.entries(groupedPatients).map(([date, patientsOnDate]) => (
            <div key={date} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {date} ({patientsOnDate.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientsOnDate.map((patient) => (
                  <div
                    key={patient._id}
                    className="bg-slate-50/50 hover:bg-white rounded-xl border border-slate-200/70 p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-800 font-bold flex items-center justify-center text-sm">
                            {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">{patient.name}</h4>
                            <p className="text-[11px] text-slate-400">
                              {patient.age ? `${patient.age} yrs` : "Age N/A"} • {patient.gender || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => viewPatientDetails(patient)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                            title="View Full Profile"
                          >
                            <InformationCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPatientForm(patient)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Edit Info"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmPatientDelete(patient._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.contact || "No phone provided"}</span>
                        </div>

                        {patient.address && (
                          <div className="flex items-center gap-2 text-slate-500 truncate">
                            <BuildingOffice2Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{patient.address}</span>
                          </div>
                        )}

                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 mt-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Medical History
                          </p>
                          <p className="text-xs text-slate-700 line-clamp-2">
                            {patient.history || "No prior history specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => navigate("/prescriptions/add", { state: { patient } })}
                        className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <DocumentPlusIcon className="w-4 h-4" />
                        <span>Issue Prescription</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 text-xs sm:text-sm">
              No patients found matching your query.
            </div>
          )}
        </div>
      </div>

      {/* Patient Form Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingPatient ? "Edit Patient Record" : "Register New Patient"}
              </h2>
              <button
                type="button"
                onClick={() => setShowPatientForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={savePatient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Patient Name"
                  value={patientFormValues.name || ""}
                  onChange={(e) => setPatientFormValues({ ...patientFormValues, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 32"
                    value={patientFormValues.age || ""}
                    onChange={(e) => setPatientFormValues({ ...patientFormValues, age: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={patientFormValues.gender || ""}
                    onChange={(e) => setPatientFormValues({ ...patientFormValues, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={patientFormValues.contact || ""}
                  onChange={(e) => setPatientFormValues({ ...patientFormValues, contact: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Address
                </label>
                <textarea
                  placeholder="Residential Address"
                  value={patientFormValues.address || ""}
                  onChange={(e) => setPatientFormValues({ ...patientFormValues, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Medical History
                </label>
                <textarea
                  placeholder="Allergies, chronic conditions..."
                  value={patientFormValues.history || ""}
                  onChange={(e) => setPatientFormValues({ ...patientFormValues, history: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPatientForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  {editingPatient ? "Update Record" : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showPatientDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <TrashIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Patient Record?</h3>
              <p className="text-xs text-slate-500 mt-1">This will permanently remove patient medical history.</p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowPatientDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Profile & History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>👤</span> Patient Profile & History
              </h2>
              <button onClick={closePatientDetails} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-700">
              {/* Left Column: Demographics */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-base">
                    {selectedPatient.name ? selectedPatient.name.charAt(0) : "P"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedPatient.name}</h3>
                    <p className="text-slate-500 mt-0.5">
                      {selectedPatient.age} years old • {selectedPatient.gender}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-semibold uppercase">Phone:</span>
                    <span className="font-semibold text-slate-800">{selectedPatient.contact || "N/A"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-semibold uppercase">Email:</span>
                    <span className="text-slate-800">{selectedPatient.email || "N/A"}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-semibold uppercase">Address:</span>
                    <span className="text-slate-800 text-right max-w-[200px] truncate">{selectedPatient.address || "N/A"}</span>
                  </p>
                </div>

                <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
                  <p className="font-bold text-slate-900 mb-1">Medical Background</p>
                  <p className="text-slate-700 leading-relaxed">{selectedPatient.history || "No background history provided."}</p>
                </div>
              </div>

              {/* Right Column: Prescription Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardDocumentListIcon className="w-4 h-4 text-teal-600" />
                    Prescription Records
                  </h3>

                  <input
                    type="date"
                    value={prescriptionDateFilter}
                    onChange={(e) => setPrescriptionDateFilter(e.target.value)}
                    className="px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {(() => {
                    const prescriptions = prescriptionsData?.data || [];
                    const patientPrescriptions = prescriptions.filter(
                      (p) => p.patient?._id === selectedPatient._id || p.patient?.name === selectedPatient.name
                    );

                    let filteredPrescriptions = patientPrescriptions;
                    if (prescriptionDateFilter) {
                      filteredPrescriptions = patientPrescriptions.filter((p) => {
                        const prescDate = new Date(p.date || p.createdAt).toISOString().split("T")[0];
                        return prescDate === prescriptionDateFilter;
                      });
                    }

                    if (filteredPrescriptions.length === 0) {
                      return <p className="text-slate-400 text-center py-6">No prescription records found</p>;
                    }

                    return filteredPrescriptions.slice(0, 5).map((p, idx) => (
                      <div
                        key={p._id}
                        onClick={() => setSelectedPrescription(p)}
                        className="p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-2xs cursor-pointer transition"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900">Rx #{p.uid || idx + 1}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(p.date || p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Dr. {p.doctor?.name || p.doctor || "N/A"} • {(p.medicines || []).length} medicines
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={closePatientDetails}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription View Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">Rx ID</span>
                  <span className="font-bold text-slate-900">{selectedPrescription.uid || selectedPrescription._id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">Date</span>
                  <span className="font-bold text-slate-900">
                    {new Date(selectedPrescription.date || selectedPrescription.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-semibold uppercase block mb-1">Prescribed Medicines</span>
                <div className="space-y-1.5">
                  {(selectedPrescription.medicines || []).map((med, idx) => (
                    <div key={idx} className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <p className="font-bold text-slate-900">{idx + 1}. {med.name || med.medicineName || "N/A"}</p>
                      <p className="text-[11px] text-slate-500">
                        {med.frequency || med.freq || "-"} • {med.duration || med.dur || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;