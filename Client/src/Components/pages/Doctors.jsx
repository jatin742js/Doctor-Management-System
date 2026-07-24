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
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyRupeeIcon,
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

  const activeDoctorsCount = (doctors || []).filter((d) => d.isActive).length;

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
    <div className="min-h-screen w-full bg-slate-50/60 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>🩺</span> Medical Staff & Practitioners
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage clinical team profiles, specialties, and consultancy fees
            </p>
          </div>

          <button
            onClick={() => openFormModal()}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Add Practitioner</span>
          </button>
        </header>

        {/* Analytics Mini Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Doctors</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{doctors.length}</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Staff</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeDoctorsCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inactive Staff</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{doctors.length - activeDoctorsCount}</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
              <XCircleIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by name, specialty, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>

            <p className="text-xs text-slate-400 self-end sm:self-center">
              Showing <span className="font-semibold text-slate-700">{filteredDoctors.length}</span> records
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  {["Practitioner", "Specialization", "Contact Info", "Consultancy Fee", "Status", "Actions"].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-xs sm:text-sm text-slate-400">
                      No doctor records matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                            {doctor.name ? doctor.name.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">{doctor.name}</p>
                            <p className="text-[11px] text-slate-400">{doctor.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <AcademicCapIcon className="w-3.5 h-3.5 text-slate-500" />
                          {doctor.specialization}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        <p className="font-medium text-slate-800">{doctor.contact}</p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-slate-900">
                        ₹{doctor.fee}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                            doctor.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {doctor.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openFormModal(doctor)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition"
                            title="Edit Doctor"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(doctor._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Doctor"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100 p-2">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div key={doctor._id} className="p-4 space-y-3 bg-white rounded-xl border border-slate-100 my-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                        {doctor.name ? doctor.name.charAt(0) : "D"}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{doctor.name}</h3>
                        <p className="text-[10px] text-slate-400">{doctor.specialization}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        doctor.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {doctor.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Contact</p>
                      <p className="font-medium text-slate-800">{doctor.contact}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Consultancy Fee</p>
                      <p className="font-bold text-slate-900">₹{doctor.fee}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => openFormModal(doctor)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(doctor._id)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No doctors found matching search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingDoctor ? "Edit Doctor Details" : "Register New Doctor"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowFormModal(false);
                  setErrorMessage("");
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization || ""}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Number (10 digits)
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact || ""}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    handleChange({
                      target: { name: "contact", value: val },
                    });
                  }}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="doctor@clinic.com"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Consultancy Fee (₹)
                </label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee || ""}
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Active Practitioner</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    setErrorMessage("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  {editingDoctor ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <TrashIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Practitioner?</h3>
              <p className="text-xs text-slate-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={removeDoctor}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}