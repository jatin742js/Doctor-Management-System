import React, { useState } from "react";
import {
  useGetDoctorsQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} from "../../store/services/doctorsApi";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function Doctors() {
  // RTK Query: fetch doctors
  const { data: doctors = [], refetch } = useGetDoctorsQuery();
  const [createDoctor] = useCreateDoctorMutation();
  const [updateDoctor] = useUpdateDoctorMutation();
  const [deleteDoctor] = useDeleteDoctorMutation();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    contact: "",
    email: "",
    fee: "",
    isActive: true,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // No need for fetchDoctors, RTK Query handles fetching

  const filteredDoctors = (doctors || []).filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openFormModal = (doctor = null) => {
    setErrorMessage("");
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData(doctor);
    } else {
      setEditingDoctor(null);
      setFormData({
        name: "",
        specialization: "",
        contact: "",
        email: "",
        fee: "",
        isActive: true,
      });
    }
    setShowFormModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      if (editingDoctor) {
        await updateDoctor({ id: editingDoctor._id, body: formData });
      } else {
        await createDoctor(formData);
      }
      refetch();
      setShowFormModal(false);
      setEditingDoctor(null);
    } catch (err) {
      console.error("Error saving doctor:", err);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteDoctorId(id);
    setShowDeleteModal(true);
  };

  const removeDoctor = async () => {
    try {
      await deleteDoctor(deleteDoctorId);
      refetch();
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting doctor:", err);
    }
  };

  return (
    <div className="min-h-screen w-full  bg-gradient-to-br from-green-50 to-teal-100  p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800">🩺 Doctor Management</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage doctor profiles and their records</p>
        </div>
      </div>

      {/* Doctors Main Content */}
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6">
          {/* Header with Search and Actions */}
          <div className="header-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 ipad:flex-col">
            <h2 className="header-title text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
              Doctor Records ({doctors.length} doctors)
            </h2>

            <div className="header-controls flex flex-col sm:flex-row gap-3 w-full sm:w-auto ipad:flex-row ipad:items-center ipad:justify-start">
              <div className="relative w-full sm:w-64 ipad:w-80">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
                />
              </div>
              <button
                onClick={() => openFormModal()}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full sm:w-auto"
              >
                <PlusCircleIcon className="w-5 h-5" />
                New Doctor
              </button>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="overflow-x-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
            {/* Desktop Table */}
           <table className="hidden md:table min-w-full divide-y divide-gray-300">
  <thead className="bg-gray-50">
    <tr>
      {["Name", "Specialization", "Contact", "Consultancy Fee", "Status", "Actions"].map((header) => (
        <th
          key={header}
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>

  <tbody className="bg-white divide-y divide-gray-200">
    {filteredDoctors.length === 0 ? (
      <tr>
        <td
          colSpan="6"
          className="text-center py-6 text-gray-500 font-medium"
        >
          No doctors found
        </td>
      </tr>
    ) : (
      filteredDoctors.map((doctor) => (
        <tr key={doctor._id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{doctor.name}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialization}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.contact}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{doctor.fee}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                doctor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {doctor.isActive ? (
                <CheckCircleIcon className="w-4 h-4 mr-1" />
              ) : (
                <XCircleIcon className="w-4 h-4 mr-1" />
              )}
              {doctor.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
            <button
              onClick={() => openFormModal(doctor)}
              className="text-yellow-600 hover:text-yellow-900"
              title="Edit"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => confirmDelete(doctor._id)}
              className="text-red-600 hover:text-red-900"
              title="Delete"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>



            {/* Mobile Card View */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="w-6 h-6 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-900">{doctor.name}</h3>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          doctor.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doctor.isActive ? (
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircleIcon className="w-3 h-3 mr-1" />
                        )}
                        {doctor.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-700">
                      <p>
                        <span className="font-medium">Specialization:</span> {doctor.specialization}
                      </p>
                      <p>
                        <span className="font-medium">Contact:</span> {doctor.contact}
                      </p>
                      <p>
                        <span className="font-medium">Fee:</span> ₹{doctor.fee}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => openFormModal(doctor)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(doctor._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 col-span-full">
                  No doctors found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Doctor Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</h2>

            {errorMessage && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{errorMessage}</div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input type="text" name="name" value={formData.name || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input type="text" name="specialization" value={formData.specialization || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="text"
                name="contact"
                value={formData.contact || ""}
                onChange={(e) => {
                  let val = e.target.value;

                  // ❗ Sirf numbers allow
                  val = val.replace(/\D/g, "");

                  // ❗ Maximum 10 digits
                  val = val.slice(0, 10);

                  handleChange({
                    target: { name: "contact", value: val }
                  });
                }}
                className="w-full border px-3 py-2 rounded-lg text-sm"
                required
              />


              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultancy Fee</label>
                <input type="number" name="fee" value={formData.fee || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => { setShowFormModal(false); setErrorMessage(""); }} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">{editingDoctor ? "Update" : "Add"} Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
            <p className="mb-4">Are you sure you want to delete this doctor?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={() => removeDoctor()} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* iPad Specific CSS */}
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
}
