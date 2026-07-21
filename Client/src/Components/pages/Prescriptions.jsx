import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPrescriptionsQuery, useDeletePrescriptionMutation, useUpdatePrescriptionMutation } from "../../store/services/prescriptionsApi";
// import { useGetSettingsQuery } from "../../store/services/settingsApi";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";




const Prescriptions = () => {
  const navigate = useNavigate();
  const { data: prescriptionsData, refetch } = useGetPrescriptionsQuery();
  const [deletePrescription] = useDeletePrescriptionMutation();
  const [updatePrescription] = useUpdatePrescriptionMutation();
  // const { data: settingsData } = useGetSettingsQuery();
  const [prescriptions, setPrescriptions] = useState([]);
  // search/filter
  const [searchQuery, setSearchQuery] = useState("");

  const [expanded, setExpanded] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPrescription, setEditPrescription] = useState(null);
  const [editMedicines, setEditMedicines] = useState([]);
  const [clinic, setClinic] = useState({});

  

  // Fetch clinic info from RTK Query
  // useEffect(() => {
  //   if (settingsData) {
  //     const s = settingsData.setting || settingsData;
  //     setClinic({
  //       name: s.clinicName || "Clinic Name",
  //       address: s.address || "Clinic Address",
  //       email: s.email || "clinic@example.com",
  //       contact: s.phone || "+91-0000000000",
  //     });
  //   }
  // }, [settingsData]);

  // Fetch prescriptions from RTK Query
  useEffect(() => {
    if (prescriptionsData?.data) {
      // Sort latest first. Copy the array before sorting because RTK Query may return
      // an immutable/frozen array from the cache — sorting in-place would throw
      // "0 is read-only" when attempting to write to a frozen array.
      const source = Array.isArray(prescriptionsData.data) ? prescriptionsData.data : [];
      const sorted = [...source].sort(
        (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      setPrescriptions(sorted);
    } else if (prescriptionsData) {
      setPrescriptions([]);
    }
  }, [prescriptionsData]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeletePrescription = async () => {
    if (!deleteId) return;
    try {
      await deletePrescription(deleteId).unwrap();
      setPrescriptions((prev) => prev.filter((p) => p._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      refetch();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete prescription");
    }
  };

 // Print prescription with Diagnosis, Investigations, Medical History and Follow-up
const printPrescription = (p) => {
  // small helper to escape HTML
  const escapeHtml = (str) => {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // normalize helpers
  const toText = (v) => {
    if (v === undefined || v === null) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "object") {
      // try common keys
      return v.name || v.text || v.title || JSON.stringify(v);
    }
    return String(v);
  };

  const toListHtml = (v) => {
    if (!v && v !== 0) return "<div>-</div>";
    
    // Flatten and collect all items
    let allItems = [];
    
    if (Array.isArray(v)) {
      allItems = v.filter(Boolean).flatMap(item => {
        const text = toText(item);
        // Split by common separators: newlines, commas, "and", "&"
        return text.split(/[\r\n,&]|(?:\s+and\s+)/).map(s => s.trim()).filter(Boolean);
      });
    } else if (typeof v === "string") {
      // Split by newlines, commas, "and", "&"
      allItems = v.split(/[\r\n,&]|(?:\s+and\s+)/).map(s => s.trim()).filter(Boolean);
    } else {
      return `<div>${escapeHtml(toText(v))}</div>`;
    }
    
    // Remove duplicates and format output
    const uniqueItems = [...new Set(allItems)];
    
    if (uniqueItems.length === 0) return "<div>-</div>";
    if (uniqueItems.length === 1) return `<div>${escapeHtml(uniqueItems[0])}</div>`;
    
    return `<ul>${uniqueItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  };

  // medicines table rows
  const medicinesList = (p.medicines || [])
    .map((med) => {
      const name = escapeHtml(med?.name || med?.medicineName || "-");
      const freq = escapeHtml(med?.frequency || med?.freq || "-");
      const dur = escapeHtml(med?.duration || med?.dur || "-");
      const instr = escapeHtml(med?.instruction ?? med?.Instruction ?? med?.note ?? "-");
      return `<tr>
          <td>${name}</td>
          <td>${freq}</td>
          <td>${dur}</td>
          <td>${instr}</td>
        </tr>`;
    })
    .join("") || `<tr><td colspan="4">-</td></tr>`;

  // diagnosis (support string/array/object)
  const diagCandidates = [
    p.diagnosis, p.diagnoses, p.dx, p.clinicalDiagnosis, p.notes?.diagnosis, p.meta?.diagnosis,
  ];
  let diagnosisText = "";
  for (const c of diagCandidates) {
    if (c === undefined || c === null) continue;
    const t = toText(c).trim();
    if (t) {
      diagnosisText = t;
      break;
    }
  }

  // investigations
  const invCandidates = [
    p.investigations, p.investigation, p.investigationsAdvised, p.tests, p.labTests, p.notes?.investigations,
  ];
  let investigationsVal = null;
  for (const c of invCandidates) {
    if (c === undefined || c === null) continue;
    // choose the first non-empty candidate
    const t = (Array.isArray(c) && c.length) || (typeof c === "string" && c.trim()) || (typeof c === "object" && Object.keys(c).length)
      ? c
      : null;
    if (t) {
      investigationsVal = t;
      break;
    }
  }

  // medical history
  const histCandidates = [
    p.medicalHistory, p.medical_history, p.history, p.pastHistory, p.past_history, p.patient?.medicalHistory, p.notes?.medicalHistory,
  ];
  let medicalHistoryText = "";
  for (const c of histCandidates) {
    if (c === undefined || c === null) continue;
    const t = toText(c).trim();
    if (t) {
      medicalHistoryText = t;
      break;
    }
  }

  // follow-up
  const followCandidates = [
    p.followUp, p.follow_up, p.nextVisit, p.next_visit, p.nextAppointment, p.followup, p.notes?.followUp,
  ];
  let followUpText = "";
  for (const c of followCandidates) {
    if (c === undefined || c === null) continue;
    const t = toText(c).trim();
    if (t) {
      followUpText = t;
      break;
    }
  }

  // formatted date
  const formattedDate = new Date(p.date || p.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  });

  

  // clinic fallback values (use existing clinic variable)
  const clinicName = escapeHtml((clinic && clinic.name) || "");
  const clinicAddress = escapeHtml((clinic && clinic.address) || "");
  const clinicEmail = escapeHtml((clinic && clinic.email) || "-");
  const clinicContact = escapeHtml((clinic && clinic.contact) || "-");

  const content = `
    <html>
      <head>
        <title>Prescription - ${escapeHtml(p.patient?.name || "")}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.45; color: #222; margin-left: 5cm; margin-top: 6cm; }
          h2,h3,h4 { margin: 0; }
          .clinic-info { text-align: center; margin-bottom: 18px; }
          .header-line { border-top: 2px solid #000; margin: 8px 0 18px 0; }
          .info-block { margin-bottom: 5px; margin-top: -5px; }
          .two-col { display:flex; gap:18px; flex-wrap:wrap; }
          .col { flex:1; min-width:180px; }
          table { width:100%; border-collapse: collapse; margin-top:12px; }
          th, td { border:1px solid #555; padding:8px; text-align:left; vertical-align:top; }
          th { background:#f0f0f0; }
          ul { margin:0 0 0 18px; padding:0; }
          .section { margin-top:7px; margin-bottom: 7px; }
          .label { font-weight:600; }
          .footer { margin-top:24px; text-align:center; font-size:13px; color:#666; }
/* Medicines Table Auto Expand Layout */
.meds-table th:nth-child(1),
.meds-table td:nth-child(1) {
  width: auto;         /* auto expand */
}

.meds-table th:nth-child(2),
.meds-table td:nth-child(2),
.meds-table th:nth-child(3),
.meds-table td:nth-child(3),
.meds-table th:nth-child(4),
.meds-table td:nth-child(4) {
  width: 12%;          /* small fixed width */
  white-space: nowrap; /* prevent wrapping */
}

        </style>
      </head>
      <body>
        <!-- <div class="clinic-info">
          <h2>${clinicName}</h2>
          <div>${clinicAddress}</div>
          <div>Email: ${clinicEmail} | Contact: ${clinicContact}</div>
          <div style="margin-top:8px;"><strong>Date:</strong> ${escapeHtml(formattedDate)}</div>
        </div>

        <div class="header-line"></div> -->

        <div class="info-block two-col">
          <div class="col">
            <h3>Patient Details</h3>
            <div><strong>Name:</strong> ${escapeHtml(p.patient?.name || "-")}</div>
            <div><strong>Age/Gender:</strong> ${escapeHtml(p.patient?.age || p.patientAge || "N/A")} / ${escapeHtml(p.patient?.gender || p.patientGender || "N/A")}</div>
            <div><strong>Phone:</strong> ${escapeHtml(p.patient?.contact || "-")}</div>
            <div><strong>Prescription ID:</strong> ${escapeHtml(p.uid || p._id || "-")}</div>
          </div>

          <div class="col">
            <h3>Consultation</h3>
            <div><strong>Doctor:</strong> ${escapeHtml(p.doctor?.name || p.doctor || "-")}</div>
            <div><strong>Date:</strong> ${escapeHtml(formattedDate)}</div>
            <div><strong>Follow-up:</strong> ${escapeHtml(
              // try format followUp as date if possible
              (function() {
                if (!followUpText) return "-";
                const maybeDate = new Date(followUpText);
                if (!Number.isNaN(maybeDate.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(followUpText)) {
                  return maybeDate.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
                }
                return followUpText;
              })()
            )}</div>
          </div>
        </div>

        <div class="section">
          <h4 class="label">Medical History</h4>
          <div>${medicalHistoryText ? escapeHtml(medicalHistoryText) : "-"}</div>
        </div>

        <div class="section">
          <h4 class="label">Diagnosis</h4>
          <div>${diagnosisText ? escapeHtml(diagnosisText) : "-"}</div>
        </div>

        <div class="section">
          <h4 class="label">Investigations</h4>
          <div>
            ${investigationsVal ? toListHtml(investigationsVal) : "<div>-</div>"}
          </div>
        </div>

        <div class="section">
          <h4>Medicines</h4>
          <table>
            <thead>
              <tr><th>Name</th><th>Frequency</th><th>Duration</th><th>Instruction</th></tr>
            </thead>
            <tbody>
              ${medicinesList}
            </tbody>
          </table>
        </div>

      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank", "width=800,height=1000");
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

// Format per line: Name - Frequency for Duration - Instruction
const openEditModal = (prescription) => {
  const meds = (prescription.medicines || []).map((med) => ({
    name: med.name || "",
    frequency: med.frequency || "",
    duration: med.duration || "",
    instruction: med.instruction ?? med.Instruction ?? "",
  }));
  setEditMedicines(meds);
  setEditPrescription(prescription);
  setShowEditModal(true);
};

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedPrescription = {
        ...editPrescription,
        medicines: editMedicines.filter((m) => m.name.trim()),
        medicalHistory: editPrescription.medicalHistory || "",
        diagnosis: editPrescription.diagnosis || "",
        investigations: editPrescription.investigations || [],
        followUp: editPrescription.followUp || null,
      };

      const res = await updatePrescription({ id: editPrescription._id, body: updatedPrescription }).unwrap();
      setPrescriptions((prev) => prev.map((p) => (p._id === editPrescription._id ? res.data : p)));
      setShowEditModal(false);
      setEditPrescription(null);
      setEditMedicines([]);
      refetch();
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update prescription");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditPrescription(null);
  };

  // ✅ Filter by searchQuery
const filteredPrescriptions = prescriptions.filter((p) => {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return true; // agar search empty hai to sab dikhado

  const name = p.patient?.name?.toLowerCase() || "";
  const uid = (p.uid || p._id || "").toString().toLowerCase();
  const phone = (p.patient?.contact || "").toString();
  const diagnosis = (p.diagnosis || p.diagnoses || "")
    ?.toString()
    ?.toLowerCase() || "";

  return (
    name.includes(q) ||
    uid.includes(q) ||
    phone.includes(q) ||
    diagnosis.includes(q)
  );
});


  // ✅ Group prescriptions by date
  const groupedPrescriptions = filteredPrescriptions.reduce((groups, p) => {

    const dateKey = new Date(p.date || p.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(p);
    return groups;
  }, {});

  return (
    <div className="w-full min-h-screen  bg-gradient-to-br from-green-50 to-teal-100  p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
          🏥 Clinic Prescription Manager
        </h1>
      </div>


      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 ipad:flex-col">

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 text-center sm:text-left">
              <DocumentTextIcon className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
              Patient Prescriptions
            </h2>
            <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto ipad:flex-row ipad:w-full ipad:justify-center ipad:items-center ipad:gap-3">
              <div className="relative w-full ipad:flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border px-0 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none w-full"
                />
                <style>{`
          /* ✅ iPad Mini specific full-width fix (portrait & landscape) */
          @media (min-width: 744px) and (max-width: 834px) {
          .ipad\\:flex-1 {
           flex: 1 1 100% !important;
         width: 100% !important;
         }
        }
`      }</style>

              </div>

              <button
                type="button"
                onClick={() => navigate("/prescriptions/add")}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition sm:w-auto ipad:w-auto min-w-[200px]"
              >
                <PlusCircleIcon className="w-5 h-5" /> Add Prescription
              </button>

            </div>
          </div>

          {/* ✅ Grouped by Date */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-260px)] pr-1 sm:pr-2">
            {Object.keys(groupedPrescriptions).length > 0 ? (
              Object.entries(groupedPrescriptions).map(([date, list]) => (
                <div key={date}>
                  <h3 className="text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                    {date}
                  </h3>

                  <div className="space-y-4">
                    {list.map((p) => (
                      <div
                        key={p._id}
                        className="bg-white rounded-xl p-4 sm:p-6 shadow hover:shadow-lg transition border border-gray-100"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                {p.patient?.name} ({p.patient?.age}, {p.patient?.gender})
                              </h3>
                              <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2.5 py-0.5 rounded">
                                {p.uid || p._id}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Medicines:</strong>{" "}
                              {(p.medicines || []).length} prescribed
                            </p>
                          </div>

                          <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
                            <button
                              type="button"
                              onClick={() => toggleExpand(p._id)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                              title="View Details"
                            >
                              <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => printPrescription(p)}
                              className="p-2 rounded-lg bg-green-100 hover:bg-green-200"
                              title="Print"
                            >
                              <DocumentTextIcon className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200"
                              title="Edit"
                            >
                              <PencilSquareIcon className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(p._id)}
                              className="p-2 rounded-lg bg-red-100 hover:bg-red-200"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      
                      {/*view details*/}
                      {expanded[p._id] && (
            <div className="mt-4 text-sm text-gray-700 border-t pt-3 space-y-2">
              <p><strong>Patient Phone:</strong> {p.patient?.contact || "-"}</p>
              <p><strong>UID:</strong> {p.uid || p._id}</p>

              {/* Medical History */}
              <div className="mt-2">
                <strong>Medical History:</strong>
                <div className="text-gray-600 text-sm mt-1 ml-0">
                  {p.medicalHistory
                    ? p.medicalHistory
                    : (p.medical_history ? p.medical_history : "-")}
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mt-2">
                <strong>Diagnosis:</strong>
                <div className="text-gray-600 text-sm mt-1 ml-0">
                  {(() => {
                    const raw = p.diagnosis ?? p.diagnoses ?? p.dx;
                    if (!raw) return "-";
                    if (typeof raw === "string") return raw;
                    if (typeof raw === "object") return raw.text || raw.name || JSON.stringify(raw);
                    return String(raw);
                  })()}
                </div>
              </div>

              {/* Investigations */}
              <div className="mt-2">
                <strong>Investigations:</strong>
                <div className="text-gray-600 text-sm mt-1 ml-4">
                  {(() => {
                    const raw =
                      p.investigations ??
                      p.investigation ??
                      p.investigationsAdvised ??
                      p.tests ??
                      p.investigation_advised;
                    if (!raw) return <span>-</span>;

                    if (Array.isArray(raw)) {
                      return (
                        <ul className="list-disc list-inside">
                          {raw.map((it, i) => {
                            if (!it) return null;
                            if (typeof it === "string") return <li key={i}>{it}</li>;
                            return <li key={i}>{it.name || it.test || JSON.stringify(it)}</li>;
                          })}
                        </ul>
                      );
                    }

                    if (typeof raw === "string") {
                      const parts = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
                      if (parts.length > 1) {
                        return (
                          <ul className="list-disc list-inside">
                            {parts.map((pLine, idx) => <li key={idx}>{pLine}</li>)}
                          </ul>
                        );
                      }
                      return <span>{raw}</span>;
                    }

                    // object fallback
                    return <span>{raw.name || raw.test || JSON.stringify(raw)}</span>;
                  })()}
                </div>
              </div>

              {/* Follow-up */}
              <div className="mt-2">
                <strong>Follow-up:</strong>
                <div className="text-gray-600 text-sm mt-1 ml-0">
                  {(() => {
                    const raw = p.followUp ?? p.follow_up ?? p.nextVisit ?? p.next_visit ?? p.nextAppointment;
                    if (!raw) return "-";
                    const s = String(raw);
                    const d = new Date(s);
                    // if looks like ISO-ish date, show formatted, else show text
                    if (!Number.isNaN(d.getTime()) && /\d{4}-\d{2}-\d{2}/.test(s)) {
                      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
                    }
                    return s;
                  })()}
                </div>
              </div>

              {/* Medicines */}
              <div className="mt-3">
                <strong>Medicines:</strong>
                <ul className="list-disc list-inside mt-1">
                  {(p.medicines || []).map((med, idx) => {
                    const instruction = med.instruction ?? med.Instruction ?? null;
                    return (
                      <li key={idx} className="mb-1">
                        {med.name} - {med.frequency} for {med.duration}
                        {instruction && (
                          <div className="text-gray-600 text-sm mt-1 ml-4">
                            <strong>Instruction:</strong> {instruction}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 border-2  rounded-xl">
                No prescriptions found. Create your first prescription.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
            <p className="mb-4">Are you sure you want to delete this prescription?</p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePrescription}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-4xl shadow-lg my-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Edit Prescription
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Patient Information */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-800 mb-3">Patient Information</h3>
                <div>
                  <label className="block font-medium text-gray-700">Patient Name</label>
                  <input
                    type="text"
                    value={editPrescription.patient?.name || ""}
                    onChange={(e) =>
                      setEditPrescription({ ...editPrescription, patient: { ...editPrescription.patient, name: e.target.value } })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  />
                </div>
              </div>

              {/* Medical History */}
              <div className="border-b pb-4">
                <label className="block font-medium text-gray-700 mb-2">Medical History</label>
                <textarea
                  value={editPrescription.medicalHistory || ""}
                  onChange={(e) =>
                    setEditPrescription({ ...editPrescription, medicalHistory: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                  placeholder="Enter medical history..."
                  rows="8"
                />
              </div>

              {/* Diagnosis */}
              <div className="border-b pb-4">
                <label className="block font-medium text-gray-700 mb-2">Diagnosis</label>
                <textarea
                  value={editPrescription.diagnosis || ""}
                  onChange={(e) =>
                    setEditPrescription({ ...editPrescription, diagnosis: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                  placeholder="Enter diagnosis..."
                  rows="8"
                />
              </div>

              {/* Investigations */}
              <div className="border-b pb-4">
                <label className="block font-medium text-gray-700 mb-2">Investigations</label>
                <textarea
                  value={(editPrescription.investigations || []).join("\n")}
                  onChange={(e) =>
                    setEditPrescription({ ...editPrescription, investigations: e.target.value.split("\n").filter(i => i.trim()) })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                  placeholder="Enter investigations (one per line)"
                  rows="8"
                />
              </div>

              {/* Follow-up */}
              <div className="border-b pb-4">
                <label className="block font-medium text-gray-700 mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={editPrescription.followUp ? new Date(editPrescription.followUp).toISOString().split('T')[0] : ""}
                  onChange={(e) =>
                    setEditPrescription({ ...editPrescription, followUp: e.target.value ? new Date(e.target.value) : null })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </div>

              {/* Medicines */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block font-medium text-gray-700">Medicines</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMedicines([
                        ...editMedicines,
                        { name: "", frequency: "", duration: "", instruction: "" }
                      ]);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    + Add Medicine
                  </button>
                </div>
                <div className="space-y-3">
                  {editMedicines.map((med, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1 space-y-2">
                        {/* Medicine Name */}
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => {
                            const updated = [...editMedicines];
                            updated[idx].name = e.target.value;
                            setEditMedicines(updated);
                          }}
                          placeholder="Medicine Name"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                        />
                        
                        {/* Frequency & Duration Row */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => {
                              const updated = [...editMedicines];
                              updated[idx].frequency = e.target.value;
                              setEditMedicines(updated);
                            }}
                            placeholder="Frequency (e.g., 1-1-1)"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => {
                              const updated = [...editMedicines];
                              updated[idx].duration = e.target.value;
                              setEditMedicines(updated);
                            }}
                            placeholder="Duration (e.g., 7 days)"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        
                        {/* Instructions */}
                        <input
                          type="text"
                          value={med.instruction}
                          onChange={(e) => {
                            const updated = [...editMedicines];
                            updated[idx].instruction = e.target.value;
                            setEditMedicines(updated);
                          }}
                          placeholder="Instructions (optional)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditMedicines(editMedicines.filter((_, i) => i !== idx));
                        }}
                        className="mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </form>
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
      .ipad\\:justify-center {
        justify-content: center !important;
      }
      .ipad\\:items-center {
        align-items: center !important;
      }
      .ipad\\:gap-3 {
        gap: 0.75rem !important;
      }
    }
  `}</style>
    </div>
  );
};

export default Prescriptions;
