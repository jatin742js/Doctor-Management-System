// BillingPage.jsx
import React, { useState } from "react";
import {
  useGetBillsQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
} from "../../store/services/billingApi";
import { useGetDoctorsQuery } from "../../store/services/doctorsApi";
import { useGetPatientsQuery } from "../../store/services/patientsApi";
import { useGetSettingsQuery } from "../../store/services/settingsApi";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";

/* ----------------------------- Helpers ---------------------------------- */

// Format number to INR rupees
const formatRupees = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// Status color helper (keeps original semantics)
const getStatusColor = (status) => {
  if (status === "Paid") return "bg-green-100 text-green-800";
  if (status === "Partial") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800"; // Pending
};

// Status icon helper
const getStatusIcon = (status) => {
  if (status === "Paid") return "✔️";
  if (status === "Partial") return "⏳";
  return "❌";
};

/* ----------------------------- Component ------------------------------- */

const BillingPage = () => {
  // no direct API import here; services provide network calls

  /* ---------------------------- Local State ---------------------------- */

  // RTK Query hooks
  const { data: billsData, isLoading: isLoadingBills, refetch: refetchBills } = useGetBillsQuery();
  const { data: doctorsData } = useGetDoctorsQuery();
  const [createBill] = useCreateBillMutation();
  const [updateBill] = useUpdateBillMutation();
  const [deleteBill] = useDeleteBillMutation();
  const { data: settingsData } = useGetSettingsQuery();
  // For patient search autocomplete (frontend only)
  const { data: patientsData } = useGetPatientsQuery();
  const patients = patientsData?.patients || patientsData || [];

  // Extract lists
  const bills = billsData || [];
  const doctors = doctorsData?.doctors || doctorsData || [];

  // modal / form state
  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [billFormValues, setBillFormValues] = useState({});
  const [services, setServices] = useState([{ serviceName: "", price: 0, quantity: 1 }]);

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBillId, setDeleteBillId] = useState(null);
  // confirm full payment modal
  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false);
  const [fullPaymentBill, setFullPaymentBill] = useState(null);
  const [fullPaymentAmount, setFullPaymentAmount] = useState(0);
  const [isProcessingFullPayment, setIsProcessingFullPayment] = useState(false);

  // view details
  const [selectedBill, setSelectedBill] = useState(null);

  // search/filter
  const [searchQuery, setSearchQuery] = useState("");

  // patient selection state (we only need setter; suggestions UI removed)
  const [, setPatientSuggestions] = useState([]);
  
  // UI helpers
  const [isSaving, setIsSaving] = useState(false);

  /* ------------------------- Fetch Doctors ----------------------------- */

  // ...existing code...
  // ...existing code...




  /* ------------------------- Fetch Bills ------------------------------- */

  // ...existing code...

  /* -------------------- Patient Autocomplete (backend) ----------------- */

  // patient autocomplete helpers removed; using <select> for patient selection


  // (No click-outside handling required when using a select for patients)

  /* ----------------------- Bill Form Management ------------------------ */

  // Open add/edit form
  const openBillForm = (bill = null) => {
    if (bill) {
      setEditingBill(bill);
      let parsedServices = [{ serviceName: "", price: 0, quantity: 1 }];
      if (bill.services && typeof bill.services === "string") {
        const parts = bill.services.split(", ").map((s) => s.trim()).filter(Boolean);
        parsedServices = parts.map((s) => {
          const match = s.match(/(.+?)\s\((\d+)x([\d.]+)\)/);
          if (match) {
            return { serviceName: match[1], quantity: parseInt(match[2]), price: parseFloat(match[3]) };
          }
          return { serviceName: s, quantity: 1, price: 0 };
        });
      } else if (Array.isArray(bill.services)) {
        parsedServices = bill.services;
      }
      setServices(parsedServices);
      setBillFormValues({
        ...bill,
        patient: bill.patient?._id || bill.patient || "",
        doctor: bill.doctor?._id || bill.doctor || "",
        nextPayment: 0,
      });
      setPatientSuggestions([]);
      if (bill.date) {
        const d = new Date(bill.date);
        if (!isNaN(d)) {
          setBillFormValues((prev) => ({ ...prev, date: d.toISOString().split("T")[0] }));
        }
      }
    } else {
      setEditingBill(null);
      setBillFormValues({
        patient: "",
        contact: "",
        age: "",
        gender: "",
        date: new Date().toISOString().split("T")[0],
        doctor: "",
        paymentMethod: "Cash",
        status: "Pending",
        paidAmount: 0,
        nextPayment: 0,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, "0")}`,
      });
      setServices([{ serviceName: "", price: 0, quantity: 1 }]);
      setPatientSuggestions([]);
    }
    setShowBillForm(true);
  };

  // Service row change
  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    if (field === "price" || field === "quantity") {
      const num = Number(value);
      newServices[index][field] = isNaN(num) ? 0 : num;
    } else {
      newServices[index][field] = value;
    }
    setServices(newServices);
  };

  const addService = () => setServices([...services, { serviceName: "", price: 0, quantity: 1 }]);
  const removeService = (index) => setServices(services.filter((_, i) => i !== index));

  // compute totals live
  const computeTotal = () => {
    return services.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 0), 0);
  };

  // Save bill (create or update)
  const saveBill = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const servicesString = services
      .filter((s) => s.serviceName && Number(s.price) > 0)
      .map((s) => `${s.serviceName} (${s.quantity}x${s.price})`)
      .join(", ");
    const totalAmount = computeTotal();
    const payload = {
      ...billFormValues,
      patient: billFormValues.patient,
      doctor: billFormValues.doctor,
      services: servicesString,
      amount: totalAmount,
      contact: billFormValues.contact || "",
    };
    if (editingBill && editingBill._id) {
      const prevPaid = Number(editingBill.paidAmount || 0);
      const nextPayment = Number(billFormValues.nextPayment || 0);
      payload.paidAmount = prevPaid + nextPayment;
    } else {
      payload.paidAmount = Number(billFormValues.paidAmount) || 0;
    }
    try {
      if (editingBill && editingBill._id) {
        await updateBill({ id: editingBill._id, body: payload }).unwrap();
      } else {
        await createBill(payload).unwrap();
      }
      setShowBillForm(false);
      setEditingBill(null);
      setPatientSuggestions([]);
      refetchBills();

      // Dispatch event for Dashboard to refresh todayRevenue
      // window.dispatchEvent(new Event("billingUpdated"));
    } catch (err) {
      console.error("Error saving invoice:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /* -------------------------- Delete Bill ------------------------------ */

  const confirmDelete = (id) => {
    setDeleteBillId(id);
    setShowDeleteModal(true);
  };

  const deleteBillHandler = async () => {
    try {
      await deleteBill(deleteBillId).unwrap();
      setShowDeleteModal(false);
      setDeleteBillId(null);
      refetchBills();
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  /* ------------------------- Toggle Status ----------------------------- */

  const toggleStatus = async (bill) => {
    if (bill.status === "Paid") return;
    // Open confirmation modal to mark as fully paid
    const fullAmount = Number(bill.amount) || 0;
    const currentPaid = Number(bill.paidAmount) || 0;
    const suggested = currentPaid < fullAmount ? fullAmount : currentPaid;
    setFullPaymentBill(bill);
    setFullPaymentAmount(suggested);
    setShowFullPaymentModal(true);
  };

  const confirmFullPayment = async () => {
    if (!fullPaymentBill) return;
    setIsProcessingFullPayment(true);
    try {
  const billToUpdate = fullPaymentBill;
  const newPaid = Number(fullPaymentAmount || 0);
      const payload = { status: "Paid", paidAmount: Number(newPaid) };
      // use RTK Query mutation shape consistent with other usages
      await updateBill({ id: billToUpdate._id, body: { ...billToUpdate, ...payload } }).unwrap();
      // refresh list from server rather than mutating local array
      refetchBills();
      setShowFullPaymentModal(false);
      setFullPaymentBill(null);

      // Dispatch event for Dashboard to refresh todayRevenue
      window.dispatchEvent(new Event("billingUpdated"));
    } catch (err) {
      console.error("Error confirming full payment:", err);
      alert("Failed to mark as paid. Try again.");
    } finally {
      setIsProcessingFullPayment(false);
    }
  };

  /* ------------------------- View / Print ------------------------------ */

  const viewBillDetails = (bill) => setSelectedBill(bill);
  const closeBillDetails = () => setSelectedBill(null);

  const printBill = async (bill) => {
    try {
      const settings = settingsData || {};
      const servicesHtml = (bill.services || "")
        .split(", ")
        .map((s) => {
          const match = s.match(/(.+?) \((\d+)x([\d.]+)\)/);
          if (!match) return "";
          const name = match[1];
          const qty = match[2];
          const price = match[3];
          const total = (Number(qty) * Number(price)).toFixed(2);
          return `<tr>
                    <td style="padding:8px; border:1px solid #ddd;">${name}</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:center;">${qty}</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:right;">${Number(price).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:right;">${Number(total).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
                  </tr>`;
        })
        .join("");
      const previousPaidAmount = bill.lastPayment ? Number(bill.lastPayment.previousPaid || 0) : Number(bill.paidAmount || 0);
      const prevPaidHtml = previousPaidAmount > 0 ? `<div><strong>Previously Paid:</strong> ${previousPaidAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>` : "";

      // Use backend-maintained fields: todayPaidAmount, todayPaidDate, nextDueAmount (preferred)
      const todayPaymentHtml = (() => {
        const todayPaid = Number(bill.todayPaidAmount || 0);
        if (todayPaid <= 0) return "";
        const todayDate = bill.todayPaidDate ? new Date(bill.todayPaidDate).toLocaleDateString() : "Today";
        const nextDue = Number(bill.nextDueAmount || 0);
        return `
          <div><strong>Today's Payment:</strong> ${todayPaid.toLocaleString("en-IN", { style: "currency", currency: "INR" })} (${todayDate})</div>
          <div><strong>Next Payment Due:</strong> ${nextDue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
        `;
      })();

      // Fallback: payment breakdown HTML when available (legacy, shows today's payment and next due if lastPayment exists)
      const paymentBreakdownHtml = (() => {
        if (!bill.lastPayment) return "";
        const today = Number(bill.lastPayment.amount || 0);
        const paidNow = Number(bill.paidAmount || 0);
        const totalAmount = Number(bill.amount || 0);
        const nextDue = totalAmount - paidNow;
        return `
          <div><strong>Today's Payment:</strong> ${today.toLocaleString("en-IN", { style: "currency", currency: "INR" })} (${new Date(bill.lastPayment.date).toLocaleDateString()})</div>
          <div><strong>Next Payment Due:</strong> ${nextDue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
        `;
      })();
      const content = `
        <html>
          <head>
            <title>Invoice - ${bill.invoiceNumber || ""}</title>
            <style>
              body { font-family: Arial, Helvetica, sans-serif; color: #222; padding: 24px; }
              .header { text-align: center; margin-bottom: 12px; }
              .details { margin-bottom: 18px; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { padding: 8px; border: 1px solid #ddd; }
              th { background: #f3f4f6; text-align: left; }
              .total { text-align: right; font-weight: bold; margin-top: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              ${settings.logo ? `<img src="${settings.logo}" alt="Logo" style="max-height:80px; margin-bottom:8px;" />` : ""}
              <h2>${settings.clinicName || "Clinic"}</h2>
              <div>${settings.address || ""}</div>
              <div>
                Contact: ${settings.phone || "N/A"} ${settings.phone && settings.email ? "|" : ""} ${settings.email ? ` Email: ${settings.email}` : ""}
              </div>
            </div>
            <div class="details">
              <div><strong>Invoice #:</strong> ${bill.invoiceNumber || ""}</div>
              <div><strong>Patient:</strong>   ${bill.patientName || bill.patient?.name || ""}</div>
              <div><strong>Contact:</strong> ${bill.contact || bill.contactNumber || "N/A"}</div>
              <div><strong>Doctor:</strong>   ${bill.doctor?.name || ""}
                ${
                  bill.doctor?.specialization || bill.doctor?.department
                    ? ` (${bill.doctor?.specialization || bill.doctor?.department})`
                    : ""
                }</div>
              <div><strong>Date:</strong> ${bill.date ? new Date(bill.date).toLocaleDateString() : ""}</div>
              <div><strong>Payment:</strong> ${bill.paymentMethod || ""}</div>
              ${prevPaidHtml}
              <div><strong>Total Paid Amount:</strong> ${Number(bill.paidAmount || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
              ${todayPaymentHtml || paymentBreakdownHtml}
              <div><strong>Balance:</strong> ${(Number(bill.amount || 0) - Number(bill.paidAmount || 0)).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
            </div>
            <table role="table" aria-label="services">
              <thead>
                <tr><th>Service</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr>
              </thead>
              <tbody>
                ${servicesHtml}
              </tbody>
            </table>
            <div class="total">Total Amount: ${Number(bill.amount || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
            <div class="total">Paid: ${Number(bill.paidAmount || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
            <div class="total">Balance: ${(Number(bill.amount || 0) - Number(bill.paidAmount || 0)).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
            <script>
              window.onload=function(){ window.print(); setTimeout(()=>window.close(), 300); }
            </script>
          </body>
        </html>
      `;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(content);
      printWindow.document.close();
    } catch (err) {
      console.error("Error printing bill:", err);
    }
  };

  /* ------------------------ Filtering Logic ---------------------------- */

  const filteredBills = (bills || []).filter(
    (bill) =>
      (bill.patient?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (bill.invoiceNumber || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (bill.status || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  /* ---------------------------- Render -------------------------------- */
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-teal-100 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 text-center">
        <h1 className="text-2xl mt-3 sm:text-3xl md:text-4xl font-extrabold text-gray-800">
          💰 Billing & Invoicing
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Manage patient bills and payments efficiently
        </p>
      </div>

      {/* Table & Actions */}
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 ipad:flex-col"
        >
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            Billing Records ({bills.length})
          </h2>

          {/* Search + Add Bill */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ipad:flex-row ipad:items-center ipad:justify-start">
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none w-full"
              />
            </div>

            <button
              onClick={() => openBillForm()}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition w-full sm:w-auto"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Add Bill
            </button>
          </div>
        </div>


        {/* Responsive View */}
        {/* ===== Desktop/Table View ===== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg">
            <thead className="bg-gray-50">
                <tr className="text-gray-700 uppercase text-sm font-semibold">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-purple-50 transition">
                  <td className="px-4 py-3">{bill.invoiceNumber}</td>
                  <td className="px-4 py-3">{bill.patient?.name || ""}</td>
                  <td className="px-4 py-3">
                    {bill.date ? new Date(bill.date).toLocaleDateString() : ""}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatRupees(bill.amount || 0)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatRupees(bill.paidAmount || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(bill)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        bill.status
                      )}`}
                    >
                      {getStatusIcon(bill.status)}{" "}
                      <span className="ml-1">{bill.status}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <button
                      onClick={() => openBillForm(bill)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(bill._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => viewBillDetails(bill)}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => printBill(bill)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <PrinterIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    {isLoadingBills
                      ? "Loading bills..."
                      : "No billing records found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Mobile/iPad Card View ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {filteredBills.length > 0 ? (
            filteredBills.map((bill) => (
              <div
                key={bill._id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">
                    #{bill.invoiceNumber}
                  </h3>
                  <button
                    onClick={() => toggleStatus(bill)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      bill.status
                    )}`}
                  >
                    {bill.status}
                  </button>
                </div>
                <p className="text-gray-700 text-sm">
                  👤 <span className="font-medium">{bill.patient?.name || ""}</span>
                </p>
                <p className="text-gray-700 text-sm">
                  🩺 {bill.doctor?.name || ""} 
                  <span className="text-gray-500 ml-1">
                    {bill.doctor?.specialization ? `(${bill.doctor.specialization})` : ""}
                  </span>
                </p>

                <p className="text-gray-600 text-sm">
                  📅 {bill.date ? new Date(bill.date).toLocaleDateString() : ""}
                </p>
                <p className="text-gray-800 font-semibold mt-2">
                  💵 {formatRupees(bill.amount || 0)}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  ✅ Paid: {formatRupees(bill.paidAmount || 0)}
                </p>
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => openBillForm(bill)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => confirmDelete(bill._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => viewBillDetails(bill)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => printBill(bill)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <PrinterIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              {isLoadingBills ? "Loading bills..." : "No billing records found."}
            </p>
          )}
        </div>
      </div>


      {/* ======================= MODALS ======================= */}

      {/* Bill Form Modal */}
      {showBillForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2 sm:px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl p-4 sm:p-6 relative 
                    max-h-[90vh] overflow-y-auto animate-fadeIn">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center sm:text-left">
              {editingBill ? "Edit Bill" : "Add New Bill"}
            </h3>

            <form onSubmit={saveBill} className="space-y-4">
              {/* Patient select (store patient ObjectId) */}
              <div>
                <select
                  value={billFormValues.patient || ""}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const p = patients.find((x) => x._id === pid);
                    setBillFormValues((prev) => ({
                      ...prev,
                      patient: pid,
                      contact: p?.contact || prev.contact || "",
                      age: p?.age || prev.age || "",
                      gender: p?.gender || prev.gender || "",
                    }));
                    setPatientSuggestions([]);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} 
                    </option>
                  ))}
                </select>
              </div>


              {/* Contact */}
              <input
                type="text"
                placeholder="Contact"
                value={billFormValues.contact || ""}
                onChange={(e) => {
                  let val = e.target.value;

                  // ❗ Sirf digits allow
                  val = val.replace(/\D/g, "");

                  // ❗ Max 10 digits
                  if (val.length > 10) val = val.slice(0, 10);

                  setBillFormValues({ ...billFormValues, contact: val });
                }}
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
              />


              {/* Date */}
              <input
                type="date"
                value={billFormValues.date || ""}
                onChange={(e) =>
                  setBillFormValues({ ...billFormValues, date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
                required
              />

              {/* Doctor Dropdown (store doctor ObjectId) */}
              <select
                value={billFormValues.doctor || ""}
                onChange={(e) => {
                  const doc = doctors.find(d => d._id === e.target.value);
                  setBillFormValues({
                    ...billFormValues,
                    doctor: doc?._id,
                  });
                }}
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name}{doc.specialization ? ` (${doc.specialization})` : ""}
                  </option>
                ))}
              </select>


              {/* Payment Method */}
              <select
                value={billFormValues.paymentMethod || "Cash"}
                onChange={(e) =>
                  setBillFormValues({
                    ...billFormValues,
                    paymentMethod: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
              </select>

              {/* Paid Amount */}
              {editingBill ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Previously Paid</label>
                    <div className="font-semibold">{formatRupees(Number(editingBill.paidAmount || 0))}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Add Payment (Next Payment)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter new payment amount"
                      value={billFormValues.nextPayment }
                      onChange={(e) => setBillFormValues({ ...billFormValues, nextPayment: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base mt-1"
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Paid Amount"
                  value={billFormValues.paidAmount }
                  onChange={(e) =>
                    setBillFormValues({ ...billFormValues, paidAmount: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base mt-2"
                />
              )}

              {/* Services */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  Services
                </label>
                {services.map((s, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2"
                  >
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={s.serviceName}
                      onChange={(e) =>
                        handleServiceChange(index, "serviceName", e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={s.quantity}
                        onChange={(e) =>
                          handleServiceChange(index, "quantity", e.target.value)
                        }
                        className="w-20 sm:w-16 border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        min="0"
                        value={s.price}
                        onChange={(e) =>
                          handleServiceChange(index, "price", e.target.value)
                        }
                        className="w-24 border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base"
                      />
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addService}
                  className="text-purple-600 hover:text-purple-800 text-sm mt-2"
                >
                  + Add Service
                </button>
              </div>

              {/* Amount Summary */}
              <div className="flex justify-between items-center mt-1 text-sm sm:text-base">
                <div className="text-gray-600">Total</div>
                <div className="font-semibold">{formatRupees(computeTotal())}</div>
              </div>

              <div className="flex justify-between items-center mt-1 text-sm sm:text-base">
                <div className="text-gray-600">Paid</div>
                <div className="font-semibold">{formatRupees(
                  editingBill
                    ? (Number(editingBill.paidAmount ) + Number(billFormValues.nextPayment ))
                    : Number(billFormValues.paidAmount )
                )}</div>
              </div>

              <div className="flex justify-between items-center mt-1 text-sm sm:text-base">
                <div className="text-gray-600">Balance</div>
                <div className="font-semibold">{formatRupees(
                  computeTotal() - (
                    editingBill
                      ? (Number(editingBill.paidAmount ) + Number(billFormValues.nextPayment ))
                      : Number(billFormValues.paidAmount )
                  )
                )}</div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBillForm(false);
                    setEditingBill(null);
                    setPatientSuggestions([]);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                >
                  {isSaving ? "Saving..." : editingBill ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center">
            
            <p className="mb-4">
              Are you sure you want to delete this bill?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deleteBillHandler}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Full Payment Modal */}
      {showFullPaymentModal && fullPaymentBill && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-3 sm:px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm animate-fadeIn text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Confirm Full Payment</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              You're about to mark invoice <strong>{fullPaymentBill.invoiceNumber}</strong> as <strong>Paid</strong>.
            </p>
            <p className="text-gray-700 mb-3">
              Patient: <strong>{fullPaymentBill.patient?.name || "-"}</strong>
            </p>
            <div className="mb-3">
              <label className="block text-sm text-gray-600">Amount to record as Paid</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fullPaymentAmount }
                onChange={(e) => setFullPaymentAmount(Number(e.target.value ))}
                className="mt-2 w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => { setShowFullPaymentModal(false); setFullPaymentBill(null); }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={isProcessingFullPayment}
              >
                Cancel
              </button>
              <button
                onClick={confirmFullPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={isProcessingFullPayment}
              >
                {isProcessingFullPayment ? "Processing..." : "Mark as Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {selectedBill && (
        <div className="fixed inset-0  flex items-center justify-center z-50 px-2 sm:px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg p-5 sm:p-6 my-6 animate-fadeIn">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center sm:text-left">
              Invoice Details
            </h3>
            <div className="space-y-2 text-sm sm:text-base">
              <p>
                <strong>Invoice #:</strong> {selectedBill.invoiceNumber}
              </p>
              <p>
                <strong>Patient:</strong> {selectedBill.patient?.name || ""}
              </p>
              <p>
  <strong>Contact:</strong>{" "}
  {(selectedBill.contact || selectedBill.contactNumber || "N/A")
    .toString()
    .slice(0, 10)}
</p>

              <p>
                <strong>Doctor:</strong> {selectedBill.doctor?.name || ""}
                {selectedBill.doctor?.specialization && (
                  <span className="text-gray-600"> ({selectedBill.doctor.specialization})</span>
                )}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {selectedBill.date
                  ? new Date(selectedBill.date).toLocaleDateString()
                  : ""}
              </p>
              <p>
                <strong>Services:</strong> {selectedBill.services}
              </p>
              <p>
                <strong>Amount:</strong> {formatRupees(selectedBill.amount || 0)}
              </p>
              <p>
                <strong>Paid:</strong> {formatRupees(selectedBill.paidAmount || 0)}
              </p>
              {selectedBill.lastPayment && (
                <>
                  <p>
                    <strong>Previously Paid:</strong> {formatRupees(selectedBill.lastPayment.previousPaid || 0)}
                  </p>
                  <p>
                    <strong>Today's Payment:</strong> {formatRupees(selectedBill.lastPayment.amount || 0)} on {new Date(selectedBill.lastPayment.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Next Payment Due:</strong> {formatRupees((selectedBill.amount || 0) - (selectedBill.paidAmount || 0))}
                  </p>
                </>
              )}
              <p>
                <strong>Balance:</strong> {formatRupees((selectedBill.amount || 0) - (selectedBill.paidAmount || 0))}
              </p>
              <p>
                <strong>Status:</strong> {selectedBill.status}
              </p>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={closeBillDetails}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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

export default BillingPage;
