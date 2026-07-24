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
  XMarkIcon,
  FolderIcon,
  CalendarDaysIcon,
  UserIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function Reports() {
  // ✅ STATE MANAGEMENT
  // RTK Query hooks
  // const [triggerPresignedUrl] = useLazyGetPresignedUrlQuery();
  const { data: reports = [], isLoading, refetch } = useGetReportsQuery();
  const [createReport, { isLoading: isCreating }] = useCreateReportMutation();
  const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();
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
    <div className="min-h-screen bg-slate-50/50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <FolderIcon className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Clinical Reports & Records
              </h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Centralized platform to manage diagnostic files and patient analytics.
            </p>
          </div>

          <button
            onClick={() => openFormModal()}
            className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-teal-700 active:bg-teal-800 transition shadow-sm hover:shadow"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Create New Report
          </button>
        </div>

        {/* NOTIFICATION MESSAGE */}
        {message && (
          <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-sm font-medium animate-fade-in">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-teal-600 hover:text-teal-900">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Reports",
              value: totalReports,
              icon: DocumentTextIcon,
              accent: "text-blue-600 bg-blue-50 border-blue-100",
            },
            {
              label: "Completed",
              value: completedReports,
              icon: CheckCircleIcon,
              accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
            },
            {
              label: "In Progress",
              value: inProgressReports,
              icon: BriefcaseIcon,
              accent: "text-amber-600 bg-amber-50 border-amber-100",
            },
            {
              label: "Patients Served",
              value: uniquePatients,
              icon: UserCircleIcon,
              accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.accent}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* SEARCH AND FILTER BAR */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              Recent Documents
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {filteredReports.length}
              </span>
            </h2>

            <div className="relative max-w-md w-full">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by report title, patient, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* TABLE (DESKTOP) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3.5 px-6">Report Title</th>
                  <th className="py-3.5 px-6">Patient</th>
                  <th className="py-3.5 px-6">Assigned Doctor</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredReports.length > 0 ? (
                  filteredReports.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {r.title}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-700">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>{r.patient?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {r.doctor?.name ? (
                          <span className="flex items-center gap-1.5">
                            <AcademicCapIcon className="w-4 h-4 text-slate-400" />
                            {r.doctor.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(r.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                          {r.type || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ring-1 ${getStatusColor(
                            r.status
                          )}`}
                        >
                          {getStatusIcon(r.status)}
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                          {r.fileUrl && (
                            <button
                              onClick={() => handleViewFile(r._id)}
                              className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                              title="View Document File"
                            >
                              <DocumentTextIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setShowViewModal(r)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="View Quick Summary"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openFormModal(r)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Edit Report"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(r._id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Report"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                      No matching clinical reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredReports.length > 0 ? (
              filteredReports.map((r) => (
                <div key={r._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-medium text-slate-900 text-base">{r.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(r.date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        r.status
                      )}`}
                    >
                      {getStatusIcon(r.status)}
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Patient</span>
                      <span className="font-medium text-slate-700">
                        {r.patient?.name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Doctor</span>
                      <span className="font-medium text-slate-700">
                        {r.doctor?.name || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowViewModal(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      <EyeIcon className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => openFormModal(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(r._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No matching reports found.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Clinical Overview</h3>
              <button
                onClick={() => setShowViewModal(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Document Title
                </span>
                <p className="font-semibold text-slate-900 text-base">
                  {showViewModal.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block">Patient</span>
                  <span className="font-medium text-slate-800">
                    {showViewModal.patient?.name || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block">Doctor</span>
                  <span className="font-medium text-slate-800">
                    {showViewModal.doctor?.name || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block">Date</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {new Date(showViewModal.date).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block">Type</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {showViewModal.type || "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block">Status</span>
                  <span className="font-medium text-slate-800 text-xs">
                    {showViewModal.status}
                  </span>
                </div>
              </div>

              {showViewModal.description && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block">Description</span>
                  <p className="text-slate-700 text-xs mt-1">
                    {showViewModal.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowViewModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {showAddReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingReport ? "Edit Clinical Report" : "New Diagnostic Report"}
              </h3>
              <button
                onClick={() => {
                  setShowAddReportModal(false);
                  setEditingReport(null);
                  setPatientSearch("");
                  setShowPatientDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Report Title *
                </label>
                <input
                  list="titleOptions"
                  type="text"
                  name="title"
                  value={editFormData.title || ""}
                  onChange={(e) => {
                    handleFormChange(e);
                    setTitleSearch(e.target.value);
                  }}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  placeholder="e.g. Complete Blood Count (CBC)"
                  required
                />
                <datalist id="titleOptions">
                  {titleOptions.map((t, i) => (
                    <option key={i} value={t} />
                  ))}
                </datalist>
              </div>

              {/* Patient Dynamic Search */}
              <div id="patient-dropdown-container">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Patient *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patient by name or phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                  {showPatientDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-1 max-h-48 overflow-y-auto z-20 shadow-lg divide-y divide-slate-100">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((p) => (
                          <div
                            key={p._id}
                            onClick={() => {
                              setEditFormData((prev) => ({ ...prev, patient: p._id }));
                              setPatientSearch(
                                `${p.name} ${p.contact ? `(${p.contact})` : ""}`
                              );
                              setShowPatientDropdown(false);
                            }}
                            className="px-4 py-2.5 hover:bg-teal-50/50 cursor-pointer text-sm transition"
                          >
                            <div className="font-medium text-slate-800">{p.name}</div>
                            {p.contact && (
                              <div className="text-xs text-slate-400">{p.contact}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-slate-400 text-center">
                          No registered patients match search
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {editFormData.patient && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Selected:{" "}
                    {patients.find((p) => p._id === editFormData.patient)?.name}
                  </p>
                )}
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Attending Doctor *
                </label>
                <select
                  name="doctor"
                  value={editFormData.doctor || ""}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  required
                >
                  <option value="">Choose doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Report Type *
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={editFormData.type || ""}
                    onChange={handleFormChange}
                    placeholder="e.g. Bloodwork, X-Ray"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date || ""}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status || "In Progress"}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Description / Notes *
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={editFormData.description || ""}
                  onChange={handleFormChange}
                  placeholder="Additional context or patient recommendations..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition resize-none"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddReportModal(false);
                    setEditingReport(null);
                    setPatientSearch("");
                    setShowPatientDropdown(false);
                  }}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editingReport
                    ? "Update Record"
                    : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-slate-500 text-xs mt-1">
                Are you sure you want to remove this record? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}