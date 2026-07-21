// client/src/components/Reports.jsx
import React, { useEffect, useState } from "react";
import {
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  // useUploadReportFileMutation,
  // useLazyGetPresignedUrlQuery,
} from "../../store/services/reportsApi";
import { useGetPatientsQuery } from "../../store/services/patientsApi";
import { useGetDoctorsQuery } from "../../store/services/doctorsApi";
  import {
    PlusCircleIcon,
    MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  EyeIcon,
  BriefcaseIcon,
  UserCircleIcon,
  // ArrowUpTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Reports() {
  // ✅ STATE MANAGEMENT
  // RTK Query hooks
  // const [triggerPresignedUrl] = useLazyGetPresignedUrlQuery();
  const { data: reports = [], isLoading, refetch } = useGetReportsQuery();
  const [createReport] = useCreateReportMutation();
  const [updateReport] = useUpdateReportMutation();
  const [deleteReport] = useDeleteReportMutation();
  // const [uploadReportFile] = useUploadReportFileMutation();
  // For search
  const { data: doctorsData } = useGetDoctorsQuery();
  const doctors = doctorsData?.doctors || doctorsData || [];
  const { data: patientsData } = useGetPatientsQuery();
  const patients = patientsData?.patients || patientsData || [];
  // Title search (frontend only)
  const [titleSearch, setTitleSearch] = useState("");
  const [allTitles, setAllTitles] = useState([]);
  useEffect(() => {
    if (reports && reports.length) {
      const titles = [...new Set((reports || []).map(r => r.title).filter(Boolean))];
      setAllTitles(titles);
    }
  }, [reports]);
  // const [uploading, setUploading] = useState(false);
  // const [uploadFiles, setUploadFiles] = useState({});
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showViewModal, setShowViewModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  // Patient search state
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  // derive options directly from RTK Query results to avoid extra state/useEffect
  const titleOptions = titleSearch.length >= 2
    ? allTitles.filter(t => t.toLowerCase().includes(titleSearch.toLowerCase()))
    : [];
  // Filter patients based on search input
  const filteredPatients = patientSearch.trim() === ""
    ? patients
    : patients.filter(p =>
        p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        (p.contact && p.contact.includes(patientSearch))
      );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdown = document.getElementById("patient-dropdown-container");
      if (dropdown && !dropdown.contains(e.target)) {
        setShowPatientDropdown(false);
      }
    };

    if (showPatientDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPatientDropdown]);
  

  // ✅ COMPUTED STATS
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === "Completed").length;
  const inProgressReports = reports.filter(r => r.status === "In Progress").length;
  const uniquePatients = new Set(reports.map(r => (r.patient?._id || r.patient))).size;

  // ✅ OPEN ADD/EDIT MODAL
  const openFormModal = (report = null) => {
    if (report) {
      setEditingReport(report);
      setEditFormData({
        title: report.title || "",
        // store ids for patient/doctor when possible
        patient: report.patient?._id || report.patient || "",
        doctor: report.doctor?._id || report.doctor || "",
        date: report.date ? new Date(report.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        type: report.type || "",
        status: report.status || "In Progress",
        description: report.description || "",
      });
      setPatientSearch(`${report.patient?.name || ""} ${report.patient?.contact ? `(${report.patient.contact})` : ""}`);
    } else {
      setEditingReport(null);
      setEditFormData({
        title: "",
        patient: "",
        doctor: "",
        date: new Date().toISOString().slice(0, 10),
        type: "",
        status: "In Progress",
        description: "",
      });
      setPatientSearch("");
    }
    setShowPatientDropdown(false);
    setShowAddReportModal(true);
  };

  // ✅ HANDLE FORM CHANGES
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ CREATE / UPDATE REPORT
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingReport) {
        await updateReport({ id: editingReport._id, body: editFormData });
        setMessage("✅ Report updated successfully!");
      } else {
        await createReport(editFormData);
        setMessage("✅ New report created successfully!");
      }
      refetch();
      setShowAddReportModal(false);
      setEditingReport(null);
      setPatientSearch("");
      setShowPatientDropdown(false);
    } catch (err) {
      console.error("Error saving report:", err);
      setMessage("❌ Error saving report");
    }
  };

  // ✅ DELETE REPORT
  const confirmDelete = (id) => {
    setDeleteReportId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    try {
      await deleteReport(deleteReportId);
      setMessage("✅ Report deleted successfully!");
      refetch();
      setShowDeleteModal(false);
      setDeleteReportId(null);
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Failed to delete report!");
    }
  };

  // ✅ FILE UPLOAD LOGIC
  // const handleFileSelect = (reportId, file) => {
  //   setUploadFiles((prev) => ({ ...prev, [reportId]: file }));
  // };

  // const handleFileUpload = async (reportId) => {
  //   const file = uploadFiles[reportId];
  //   if (!file) {
  //     alert("Please select a file before uploading!");
  //     return;
  //   }
  //   setUploading(true);
  //   try {
  //     const fd = new FormData();
  //     fd.append("file", file);
  //     await uploadReportFile({ id: reportId, formData: fd });
  //     refetch();
  //     alert("✅ File uploaded successfully!");
  //     setUploadFiles((prev) => {
  //       const copy = { ...prev };
  //       delete copy[reportId];
  //       return copy;
  //     });
  //   } catch (err) {
  //     console.error("File upload error:", err);
  //     alert("❌ File upload failed. Please try again.");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // ✅ FILTER REPORTS BY SEARCH QUERY
  const filteredReports = reports.filter((report) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const patientName = report.patient?.name || "";
    const doctorName = report.doctor?.name || "";
    return [
      report.title || "",
      patientName,
      doctorName,
      report.status || "",
      report.type || "",
    ].some((v) => String(v).toLowerCase().includes(q));
  });

  // ✅ STATUS HELPERS
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ FETCH PRESIGNED URL AND OPEN
  // const handleViewFile = async (reportId) => {
  //   try {
  //     const result = await triggerPresignedUrl(reportId).unwrap();
  //     const url = result?.url;
  //     if (url) {
  //       window.open(url, "_blank", "noopener,noreferrer");
  //     } else {
  //       alert("❌ File not available");
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch presigned URL:", err);
  //     alert("❌ Failed to load file. Please try again.");
  //   }
  // };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "In Progress":
        return <BriefcaseIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  // ✅ LOADING INDICATOR
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-700 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  // ✅ MAIN RETURN
  return (
    <div className="min-h-screen w-full  bg-gradient-to-br from-green-50 to-teal-100  p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto mb-6">
        {/* Header */}
        <div className="text-center mb-6 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
            📊 Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage patient and clinic reports with efficiency and ease
          </p>
        </div>

        {/* ✅ STATISTICS */}
        {/* ✅ STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Reports", value: totalReports, color: "blue", icon: <DocumentTextIcon /> },
            { label: "Completed", value: completedReports, color: "green", icon: <CheckCircleIcon /> },
            { label: "In Progress", value: inProgressReports, color: "yellow", icon: <BriefcaseIcon /> },
            { label: "Unique Patients", value: uniquePatients, color: "purple", icon: <UserCircleIcon /> },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl p-3 sm:p-4 shadow border-l-4 border-${card.color}-500 flex items-center justify-between`}
            >
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{card.label}</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`text-${card.color}-500 w-6 h-6 sm:w-8 sm:h-8`}>{card.icon}</div>
            </div>
          ))}
        </div>

        {/* ✅ MESSAGE BANNER */}
        {message && (
          <div className="mb-4 text-center text-xs sm:text-sm font-medium text-gray-700 bg-white rounded-lg p-2 shadow">
            {message}
          </div>
        )}
      </div>
      {/* Main Table Section */}
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Title + Search + Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 ipad:flex-col">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              Reports ({reports.length})
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ipad:flex-row ipad:items-center ipad:justify-start">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none w-full"
                />
              </div>
              <button
                onClick={() => openFormModal()}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition w-full sm:w-auto"
              >
                <PlusCircleIcon className="w-5 h-5" />
                New Report
              </button>
            </div>
          </div>

          {/* Responsive Table / Cards */}
          <div className="overflow-x-auto rounded-xl shadow ring-1 ring-black ring-opacity-5 bg-white">
            {/* Table (Desktop) */}
            <table className="min-w-full divide-y divide-gray-300 hidden md:table text-sm sm:text-base">
              <thead className="bg-gray-50">
                <tr>
                  {["Title", "Patient", "Doctor", "Date", "Type", "Status", "Actions"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length > 0 ? (
                  filteredReports.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                      <td className="px-4 py-3 flex items-center gap-2 text-gray-800">
                        <UserCircleIcon className="w-4 h-4 text-gray-400" />
                        <span>{r.patient?.name || ""}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{r.doctor?.name || ""}</td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{r.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            r.status
                          )}`}
                        >
                          {getStatusIcon(r.status)} <span className="ml-1">{r.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2 flex-wrap items-center">
                        {/* <input
                          type="file"
                          className="hidden"
                          id={`upload-${r._id}`}
                          onChange={(e) => handleFileSelect(r._id, e.target.files[0])}
                        />
                        <label htmlFor={`upload-${r._id}`} className="cursor-pointer text-gray-600 hover:text-gray-900">
                          <ArrowUpTrayIcon className="w-4 h-4" />
                        </label> */}
                        

                        {/* 👇 Show View File (fetch presigned URL) */}
                        {r.fileUrl && (
                          <button
                            onClick={() => handleViewFile(r._id)}
                            className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                          >
                            <DocumentTextIcon className="w-4 h-4" /> View File
                          </button>
                        )}

                        <button onClick={() => setShowViewModal(r)} className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => openFormModal(r)} className="text-yellow-600 hover:text-yellow-900">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(r._id)} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500 text-sm">
                      No reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Cards (Mobile) */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((r) => (
                  <div key={r._id} className="p-4 bg-white hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{r.title}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                          r.status
                        )}`}
                      >
                        {getStatusIcon(r.status)} <span className="ml-1">{r.status}</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-700">
                      <p className="flex items-center gap-1">
                        <UserCircleIcon className="w-4 h-4 text-gray-400" /> {r.patient?.name || ""}
                      </p>
                      <p>
                        <strong>Doctor:</strong> {r.doctor?.name || ""}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(r.date).toLocaleDateString("en-GB")}
                      </p>
                      <p>
                        <strong>Type:</strong> {r.type}
                      </p>

                    </div>

                    <div className="flex items-center gap-3 mt-3 text-sm">
                      {/* <input
                        type="file"
                        className="hidden"
                        id={`upload-mobile-${r._id}`}
                        onChange={(e) => handleFileSelect(r._id, e.target.files[0])}
                      />
                      <label htmlFor={`upload-mobile-${r._id}`} className="cursor-pointer text-gray-600 hover:text-gray-900">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                      </label>
                      <button
                        onClick={() => handleFileUpload(r._id)}
                        disabled={uploading}
                        className="text-indigo-600 hover:text-indigo-900 text-xs"
                      >
                        {uploading ? "..." : "Upload"}
                      </button> */}
                      <button onClick={() => setShowViewModal(r)} className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {/* {r.fileUrl && (
                        <button
                          onClick={() => handleViewFile(r._id)}
                          className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                        >
                          <DocumentTextIcon className="w-4 h-4" /> View
                        </button>
                      )} */}
                      <button onClick={() => openFormModal(r)} className="text-yellow-600 hover:text-yellow-900">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete(r._id)} className="text-red-600 hover:text-red-900">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">No reports found.</div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ✅ MODALS */}
      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg">
            <div className="flex justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Report Details</h2>
              <button onClick={() => setShowViewModal(null)}>
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-gray-700">
              <p><b>Title:</b> {showViewModal.title}</p>
              <p><b>Patient:</b> {showViewModal.patient?.name || ""}</p>
              <p><b>Doctor:</b> {showViewModal.doctor?.name || ""}</p>
              <p><b>Date:</b> {new Date(showViewModal.date).toLocaleDateString("en-GB")}</p>
              <p><b>Type:</b> {showViewModal.type}</p>
              <p><b>Status:</b> {showViewModal.status}</p>
            </div>
            <div className="text-right mt-4">
              <button
                onClick={() => setShowViewModal(null)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddReportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">
              {editingReport ? "Edit Report" : "Create New Report"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  list="titleOptions"
                  type="text"
                  name="title"
                  value={editFormData.title || ""}
                  onChange={(e) => {
                    handleFormChange(e);
                    setTitleSearch(e.target.value);
                  }}
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                  placeholder="Enter or select title"
                  required
                />
                <datalist id="titleOptions">
                  {titleOptions.map((t, i) => (
                    <option key={i} value={t} />
                  ))}
                </datalist>
              </div>

              {/* Patient Field */}
              <div id="patient-dropdown-container">
                <label className="block text-sm font-medium mb-1">Patient</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patient by name or contact..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {showPatientDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10 shadow-lg">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((p) => (
                          <div
                            key={p._id}
                            onClick={() => {
                              setEditFormData((prev) => ({ ...prev, patient: p._id }));
                              setPatientSearch(`${p.name} ${p.contact ? `(${p.contact})` : ""}`);
                              setShowPatientDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 text-sm"
                          >
                            <div className="font-medium">{p.name}</div>
                            {p.contact && <div className="text-xs text-gray-500">{p.contact}</div>}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">No patients found</div>
                      )}
                    </div>
                  )}
                </div>
                {editFormData.patient && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Selected: {patients.find(p => p._id === editFormData.patient)?.name}
                  </div>
                )}
              </div>

              {/* Doctor Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Doctor</label>
                <select
                  name="doctor"
                  value={editFormData.doctor || ""}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                  required
                >
                  <option value="">Select doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </div>


              {/* Type Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  name="type"
                  value={editFormData.type || ""}
                  onChange={handleFormChange}
                  placeholder="Enter report type"
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={editFormData.description || ""}
                  onChange={handleFormChange}
                  placeholder="Enter description"
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                  required
                />
              </div>

              {/* Date Field */}
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date || ""}
                  onChange={handleFormChange}
                  required
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={editFormData.status || "In Progress"}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  {/* <option value="Pending">Pending</option> */}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddReportModal(false);
                    setEditingReport(null);
                    setPatientSearch("");
                    setShowPatientDropdown(false);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {isLoading ? "Saving..." : editingReport ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
          
            <p className="mb-4">
              Are you sure you want to delete this report?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
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
}

