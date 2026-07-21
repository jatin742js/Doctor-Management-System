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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-teal-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            🏥 Patient Management System
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">
            Manage your patient records efficiently
          </p>
        </div>
      </div>


      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 ipad:flex-col"
          >  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-green-600" />
              Patient Records ({patients.length} patients)
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ipad:flex-row ipad:items-center ipad:justify-start">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="pl-10 border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none w-full"
                />
              </div>
              <button
                onClick={() => navigate("/patients/add")}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition w-full sm:w-auto"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Add Patient
              </button>


            </div>
          </div>

          {/* ✅ Group patients by date */}
          {Object.entries(
            filteredPatients.reduce((acc, patient) => {
              const date =
                patient.visiteddate
                  ? new Date(patient.visiteddate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "Unknown Date";
              if (!acc[date]) acc[date] = [];
              acc[date].push(patient);
              return acc;
            }, {})
          ).map(([date, patientsOnDate]) => (
            <div key={date} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">
                📅 {date}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientsOnDate.map((patient) => (
                  <div
                    key={patient._id}
                    className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <UserCircleIcon className="w-10 h-10 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-500">
                            {patient.age ? `${patient.age} years` : "Age N/A"}, {patient.gender}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-1 mt-2 sm:mt-0">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => viewPatientDetails(patient)}
                            className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                            title="View Details"
                          >
                            <InformationCircleIcon className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => openPatientForm(patient)}
                            className="p-1 rounded-lg bg-yellow-100 hover:bg-yellow-200"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4 text-yellow-600" />
                          </button>
                          <button
                            onClick={() => confirmPatientDelete(patient._id)}
                            className="p-1 rounded-lg bg-red-100 hover:bg-red-200"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4 text-red-600" />
                          </button>
                        </div>

                        <button
                          onClick={() => navigate("/prescriptions/add", { state: { patient } })}
                          className="flex items-center justify-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-700 mt-1 sm:mt-2"
                        >
                          Add Prescription
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span>{patient.contact}</span>
                      </div>
                      <p className="text-gray-600 truncate">{patient.address}</p>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600">
                          <strong>Medical History:</strong> {patient.history}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-gray-500 border-2  rounded-xl">
              No patients found matching your search.
            </div>
          )}



        </div>
      </div>

      {/* Patient Form Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              {editingPatient ? "Edit Patient" : "Add New Patient"}
            </h2>
            <form onSubmit={savePatient} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={patientFormValues.name || ""}
                onChange={(e) =>
                  setPatientFormValues({ ...patientFormValues, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
                required
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  placeholder="Age"
                  value={patientFormValues.age || ""}
                  onChange={(e) =>
                    setPatientFormValues({ ...patientFormValues, age: e.target.value })
                  }
                  className="w-full sm:w-1/2 border px-3 py-2 rounded-lg text-sm"
                  required
                />
                <select
                  value={patientFormValues.gender || ""}
                  onChange={(e) =>
                    setPatientFormValues({ ...patientFormValues, gender: e.target.value })
                  }
                  className="w-full sm:w-1/2 border px-3 py-2 rounded-lg text-sm"
                  required
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={patientFormValues.contact || ""}
                onChange={(e) =>
                  setPatientFormValues({ ...patientFormValues, contact: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
                required
              />
              <textarea
                placeholder="Address"
                value={patientFormValues.address || ""}
                onChange={(e) =>
                  setPatientFormValues({ ...patientFormValues, address: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
                rows="2"
              />
              <textarea
                placeholder="Medical History"
                value={patientFormValues.history || ""}
                onChange={(e) =>
                  setPatientFormValues({ ...patientFormValues, history: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
                rows="3"
              />
              {/* <textarea
                placeholder="Medicines Prescribed"
                value={patientFormValues.medicines?.join(", ") || ""}
                onChange={(e) =>
                  setPatientFormValues({
                    ...patientFormValues,
                    medicines: e.target.value.split(","),
                  })
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
                rows="2"
              /> */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPatientForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                >
                  {editingPatient ? "Update" : "Add"} Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showPatientDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
            <p className="mb-4">
              Are you sure you want to delete this patient?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowPatientDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Patient Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <UserCircleIcon className="w-12 h-12 text-green-500" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedPatient.age} years, {selectedPatient.gender}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2 border-r md:pr-4">
                  <p className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span>
                      <strong>Phone:</strong> {selectedPatient.contact}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    <strong>Address:</strong> {selectedPatient.address}
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong> {selectedPatient.email || "N/A"}
                  </p>
                  <div className="bg-green-50 rounded p-3">
                    <p className="font-semibold text-gray-800 mb-2">Medical History:</p>
                    <p className="text-gray-700">{selectedPatient.history || "No history recorded"}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 gap-1">
                    <span>
                      Last Visit:{" "}
                      {new Date(selectedPatient.visiteddate).toLocaleDateString()}
                    </span>
                    {selectedPatient.nextAppointment && (
                      <span>
                        Next:{" "}
                        {new Date(selectedPatient.nextAppointment).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Prescriptions Section */}
                <div className="border-l md:pl-4">
                  <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
                    Previous Prescriptions
                  </p>
                  <div className="mb-3">
                    <input
                      type="date"
                      value={prescriptionDateFilter}
                      onChange={(e) => setPrescriptionDateFilter(e.target.value)}
                      placeholder="Filter by date"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto bg-blue-50 rounded p-3">
                    {(() => {
                      const prescriptions = prescriptionsData?.data || [];
                      const patientPrescriptions = prescriptions.filter(
                        (p) => p.patient?._id === selectedPatient._id || p.patient?.name === selectedPatient.name
                      );
                      
                      // Filter by date if date filter is provided
                      let filteredPrescriptions = patientPrescriptions;
                      if (prescriptionDateFilter) {
                        filteredPrescriptions = patientPrescriptions.filter((p) => {
                          const prescDate = new Date(p.date || p.createdAt).toISOString().split('T')[0];
                          return prescDate === prescriptionDateFilter;
                        });
                      }
                      
                      if (filteredPrescriptions.length === 0) {
                        return <p className="text-gray-500 text-xs">No prescriptions found</p>;
                      }
                      
                      return filteredPrescriptions.slice(0, 5).map((p, idx) => (
                        <div
                          key={p._id}
                          onClick={() => setSelectedPrescription(p)}
                          className="bg-white rounded p-2 border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition hover:bg-blue-100"
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="font-semibold text-xs text-gray-800">
                              Rx #{p.uid || (idx + 1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(p.date || p.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Doctor:</strong> {p.doctor?.name || p.doctor || "N/A"}
                          </p>
                          
                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Medicines:</strong> {(p.medicines || []).length} prescribed
                          </p>
                          
                          {p.diagnosis && (
                            <p className="text-xs text-gray-600 mb-1">
                              <strong>Diagnosis:</strong> {
                                typeof p.diagnosis === 'string' 
                                  ? p.diagnosis.substring(0, 50) + (p.diagnosis.length > 50 ? '...' : '')
                                  : p.diagnosis
                              }
                            </p>
                          )}
                          
                          {p.followUp && (
                            <p className="text-xs text-blue-600 font-semibold">
                              Follow-up: {new Date(p.followUp).toLocaleDateString("en-IN")}
                            </p>
                          )}
                          <p className="text-xs text-blue-500 font-semibold mt-2 hover:underline">
                            View Details →
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                  {(() => {
                    const prescriptions = prescriptionsData?.data || [];
                    const patientPrescriptions = prescriptions.filter(
                      (p) => p.patient?._id === selectedPatient._id || p.patient?.name === selectedPatient.name
                    );
                    return patientPrescriptions.length > 5 ? (
                      <p className="text-xs text-gray-500 mt-2">
                        +{patientPrescriptions.length - 5} more prescriptions
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <button
                onClick={closePatientDetails}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  openPatientForm(selectedPatient);
                  closePatientDetails();
                }}
                className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Prescription Details</h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Prescription ID</p>
                    <p className="font-semibold text-gray-900">{selectedPrescription.uid || selectedPrescription._id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedPrescription.date || selectedPrescription.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Info */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-800 mb-3">Patient & Doctor Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Patient Name</p>
                    <p className="font-medium text-gray-900">{selectedPrescription.patient?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Doctor Name</p>
                    <p className="font-medium text-gray-900">{selectedPrescription.doctor?.name || selectedPrescription.doctor || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Age / Gender</p>
                    <p className="font-medium text-gray-900">
                      {selectedPrescription.patient?.age || selectedPrescription.patientAge || "N/A"} / {selectedPrescription.patient?.gender || selectedPrescription.patientGender || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Patient Phone</p>
                    <p className="font-medium text-gray-900">{selectedPrescription.patient?.contact || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              {(selectedPrescription.medicalHistory || selectedPrescription.medical_history || selectedPrescription.history) && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Medical History</h3>
                  <div className="bg-gray-50 rounded p-3 text-gray-700">
                    {selectedPrescription.medicalHistory || selectedPrescription.medical_history || selectedPrescription.history || "-"}
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {(selectedPrescription.diagnosis || selectedPrescription.diagnoses || selectedPrescription.dx) && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Diagnosis</h3>
                  <div className="bg-red-50 rounded p-3 text-gray-700 border-l-4 border-red-500">
                    {(() => {
                      const raw = selectedPrescription.diagnosis ?? selectedPrescription.diagnoses ?? selectedPrescription.dx;
                      if (typeof raw === 'string') return raw;
                      if (typeof raw === 'object') return raw.text || raw.name || JSON.stringify(raw);
                      return String(raw);
                    })()}
                  </div>
                </div>
              )}

              {/* Investigations */}
              {(selectedPrescription.investigations || selectedPrescription.investigation || selectedPrescription.investigationsAdvised || selectedPrescription.tests) && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Investigations</h3>
                  <div className="bg-yellow-50 rounded p-3 border-l-4 border-yellow-500">
                    {(() => {
                      const raw = selectedPrescription.investigations ?? selectedPrescription.investigation ?? selectedPrescription.investigationsAdvised ?? selectedPrescription.tests;
                      if (!raw) return <p className="text-gray-500">-</p>;
                      if (Array.isArray(raw)) {
                        return (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {raw.map((item, idx) => (
                              <li key={idx}>
                                {typeof item === 'string' ? item : item.name || item.test || JSON.stringify(item)}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (typeof raw === 'string') {
                        const parts = raw.split(/\r?\n/).filter(Boolean);
                        return (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {parts.map((part, idx) => <li key={idx}>{part}</li>)}
                          </ul>
                        );
                      }
                      return <p className="text-gray-700">{String(raw)}</p>;
                    })()}
                  </div>
                </div>
              )}

              {/* Medicines */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-800 mb-3">Medicines Prescribed ({(selectedPrescription.medicines || []).length})</h3>
                <div className="space-y-2">
                  {(selectedPrescription.medicines || []).length > 0 ? (
                    (selectedPrescription.medicines || []).map((med, idx) => (
                      <div key={idx} className="bg-green-50 rounded p-3 border-l-4 border-green-500">
                        <div className="font-medium text-gray-900 mb-1">{idx + 1}. {med.name || med.medicineName || "N/A"}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <p className="font-semibold">Frequency</p>
                            <p>{med.frequency || med.freq || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Duration</p>
                            <p>{med.duration || med.dur || "-"}</p>
                          </div>
                        </div>
                        {(med.instruction || med.Instruction || med.note) && (
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <p className="text-xs font-semibold text-gray-700">Instructions:</p>
                            <p className="text-xs text-gray-600">{med.instruction || med.Instruction || med.note}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No medicines prescribed</p>
                  )}
                </div>
              </div>

              {/* Follow-up */}
              {(selectedPrescription.followUp || selectedPrescription.follow_up || selectedPrescription.nextVisit || selectedPrescription.next_visit) && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Follow-up</h3>
                  <div className="bg-purple-50 rounded p-3 border-l-4 border-purple-500 text-gray-700">
                    {(() => {
                      const raw = selectedPrescription.followUp || selectedPrescription.follow_up || selectedPrescription.nextVisit || selectedPrescription.next_visit;
                      if (!raw) return "-";
                      const s = String(raw);
                      const d = new Date(s);
                      if (!Number.isNaN(d.getTime()) && /\d{4}-\d{2}-\d{2}/.test(s)) {
                        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
                      }
                      return s;
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ iPad Specific CSS */}
  <style>{`
    @media (min-width: 768px) and (max-width: 1180px) {
      .ipad\\:flex-col {
        flex-direction: column !important;
      }
      .ipad\\:flex-row {
        flex-direction: row !important;
      }
      .ipad\\:items-center {
        align-items: center !important;
      }
      .ipad\\:justify-start {
        justify-content: flex-start !important;
      }
    }
  `}</style>

    </div>
  );
};

export default Patients;
