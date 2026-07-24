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
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ReceiptPercentIcon,
  UserIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

/* ----------------------------- Helpers ---------------------------------- */

// Format number to INR rupees
const formatRupees = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

// Status color helper
const getStatusBadge = (status) => {
  if (status === "Paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
  }
  if (status === "Partial") {
    return "bg-amber-50 text-amber-700 border-amber-200/80";
  }
  return "bg-rose-50 text-rose-700 border-rose-200/80"; // Pending
};

const getStatusIcon = (status) => {
  if (status === "Paid") return <CheckCircleIcon className="w-3.5 h-3.5" />;
  if (status === "Partial") return <ClockIcon className="w-3.5 h-3.5" />;
  return <XCircleIcon className="w-3.5 h-3.5" />;
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

    // Generate table rows for services
    const servicesHtml = (bill.services || "")
      .split(", ")
      .map((s) => {
        const match = s.match(/(.+?) \((\d+)x([\d.]+)\)/);
        if (!match) return "";
        const name = match[1];
        const qty = match[2];
        const price = match[3];
        const total = (Number(qty) * Number(price)).toFixed(2);
        return `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #1e293b;">${name}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${qty}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">${Number(price).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a;">${Number(total).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
          </tr>
        `;
      })
      .join("");

    // Payment History Calculations
    const previousPaidAmount = bill.lastPayment
      ? Number(bill.lastPayment.previousPaid || 0)
      : Number(bill.paidAmount || 0);

    const prevPaidHtml =
      previousPaidAmount > 0
        ? `<div class="info-row"><span class="label">Previously Paid:</span> <span class="val">${previousPaidAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div>`
        : "";

    const todayPaymentHtml = (() => {
      const todayPaid = Number(bill.todayPaidAmount || 0);
      if (todayPaid <= 0) return "";
      const todayDate = bill.todayPaidDate
        ? new Date(bill.todayPaidDate).toLocaleDateString("en-IN")
        : "Today";
      const nextDue = Number(bill.nextDueAmount || 0);
      return `
        <div class="info-row"><span class="label">Today's Payment:</span> <span class="val">${todayPaid.toLocaleString("en-IN", { style: "currency", currency: "INR" })} (${todayDate})</span></div>
        <div class="info-row"><span class="label">Next Payment Due:</span> <span class="val">${nextDue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div>
      `;
    })();

    const paymentBreakdownHtml = (() => {
      if (!bill.lastPayment) return "";
      const today = Number(bill.lastPayment.amount || 0);
      const paidNow = Number(bill.paidAmount || 0);
      const totalAmount = Number(bill.amount || 0);
      const nextDue = totalAmount - paidNow;
      return `
        <div class="info-row"><span class="label">Today's Payment:</span> <span class="val">${today.toLocaleString("en-IN", { style: "currency", currency: "INR" })} (${new Date(bill.lastPayment.date).toLocaleDateString("en-IN")})</span></div>
        <div class="info-row"><span class="label">Next Payment Due:</span> <span class="val">${nextDue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div>
      `;
    })();

    const totalAmount = Number(bill.amount || 0);
    const totalPaid = Number(bill.paidAmount || 0);
    const balanceDue = totalAmount - totalPaid;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice - ${bill.invoiceNumber || "Receipt"}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #334155; 
              background: #fff;
              padding: 32px;
              max-width: 800px;
              margin: 0 auto;
              font-size: 13px;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0d9488;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .clinic-info { max-width: 60%; }
            .clinic-logo { max-height: 65px; margin-bottom: 8px; object-fit: contain; }
            .clinic-name { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
            .clinic-details { font-size: 12px; color: #64748b; line-height: 1.4; }
            
            .invoice-badge { text-align: right; }
            .invoice-title { font-size: 24px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5px; }
            .invoice-num { font-size: 13px; font-weight: 600; color: #475569; margin-top: 2px; }
            .invoice-date { font-size: 12px; color: #64748b; margin-top: 2px; }

            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 16px;
              margin-bottom: 24px;
            }
            .info-block { font-size: 12px; }
            .info-block-title { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 6px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .info-row .label { color: #64748b; font-weight: 500; }
            .info-row .val { color: #0f172a; font-weight: 600; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { 
              background: #f1f5f9; 
              color: #475569; 
              font-size: 11px; 
              text-transform: uppercase; 
              letter-spacing: 0.5px;
              padding: 10px 12px;
              border-bottom: 2px solid #cbd5e1;
            }
            
            .summary-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
            }
            .payment-notes {
              flex: 1;
              background: #f8fafc;
              border-radius: 8px;
              padding: 12px;
              border-left: 3px solid #0d9488;
              font-size: 12px;
            }
            .totals-card {
              width: 280px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 14px;
            }
            .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
            .total-row.grand-total {
              border-top: 2px dashed #cbd5e1;
              margin-top: 8px;
              padding-top: 8px;
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
            }
            .total-row.balance-due {
              color: #dc2626;
              font-weight: 700;
            }

            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }

            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <!-- HEADER SECTION -->
          <div class="header-container">
            <div class="clinic-info">
              ${settings.logo ? `<img src="${settings.logo}" alt="Logo" class="clinic-logo" />` : ""}
              <div class="clinic-name">${settings.clinicName || "Healthcare Center"}</div>
              <div class="clinic-details">
                ${settings.address ? `${settings.address}<br/>` : ""}
                Ph: ${settings.phone || "N/A"} ${settings.email ? ` | Email: ${settings.email}` : ""}
              </div>
            </div>
            <div class="invoice-badge">
              <div class="invoice-title">Invoice</div>
              <div class="invoice-num">#${bill.invoiceNumber || "N/A"}</div>
              <div class="invoice-date">Date: ${bill.date ? new Date(bill.date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}</div>
            </div>
          </div>

          <!-- PATIENT & DOCTOR DETAILS -->
          <div class="details-grid">
            <div class="info-block">
              <div class="info-block-title">Patient Details</div>
              <div class="info-row"><span class="label">Name:</span> <span class="val">${bill.patientName || bill.patient?.name || "N/A"}</span></div>
              <div class="info-row"><span class="label">Contact:</span> <span class="val">${bill.contact || bill.contactNumber || "N/A"}</span></div>
            </div>
            <div class="info-block">
              <div class="info-block-title">Clinical Info</div>
              <div class="info-row"><span class="label">Doctor:</span> <span class="val">${bill.doctor?.name || "N/A"}</span></div>
              ${
                bill.doctor?.specialization || bill.doctor?.department
                  ? `<div class="info-row"><span class="label">Dept:</span> <span class="val">${bill.doctor?.specialization || bill.doctor?.department}</span></div>`
                  : ""
              }
              <div class="info-row"><span class="label">Mode:</span> <span class="val">${bill.paymentMethod || "Cash"}</span></div>
            </div>
          </div>

          <!-- SERVICES TABLE -->
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Service / Item</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 120px;">Unit Price</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHtml || `<tr><td colSpan="4" style="text-align:center; padding: 16px; color: #94a3b8;">No services specified</td></tr>`}
            </tbody>
          </table>

          <!-- SUMMARY SECTION -->
          <div class="summary-section">
            <div class="payment-notes">
              <div class="info-block-title" style="margin-bottom: 4px;">Payment History</div>
              ${prevPaidHtml}
              ${todayPaymentHtml || paymentBreakdownHtml || `<div class="info-row"><span class="label">Total Paid:</span> <span class="val">${totalPaid.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div>`}
            </div>

            <div class="totals-card">
              <div class="total-row">
                <span style="color: #64748b;">Subtotal:</span>
                <span style="font-weight: 600;">${totalAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
              <div class="total-row">
                <span style="color: #64748b;">Amount Paid:</span>
                <span style="font-weight: 600; color: #16a34a;">${totalPaid.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
              <div class="total-row grand-total ${balanceDue > 0 ? "balance-due" : ""}">
                <span>Balance Due:</span>
                <span>${balanceDue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <p>Thank you for choosing ${settings.clinicName || "our clinic"}. Wish you a speedy recovery!</p>
            <p style="margin-top:2px;">This is a computer-generated invoice.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 300);
            }
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

  // Compute stats
  const totalBilled = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const totalCollected = bills.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const totalOutstanding = totalBilled - totalCollected;

  /* ------------------------ Filtering Logic ---------------------------- */

  const filteredBills = (bills || []).filter(
    (bill) =>
      (bill.patient?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (bill.invoiceNumber || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (bill.status || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  /* ---------------------------- Render -------------------------------- */
 return (
    <div className="min-h-screen w-full bg-slate-50/60 p-4 sm:p-6 lg:p-8 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>💳</span> Billing & Revenue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Issue patient invoices, record installment collections, and print receipts
            </p>
          </div>

          <button
            onClick={() => openBillForm()}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Generate Invoice</span>
          </button>
        </header>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoiced</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatRupees(totalBilled)}</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <ReceiptPercentIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collected Paid</p>
              <p className="text-2xl font-bold text-emerald-700 mt-0.5">{formatRupees(totalCollected)}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance Due</p>
              <p className="text-2xl font-bold text-amber-600 mt-0.5">{formatRupees(totalOutstanding)}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <ClockIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Billing Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Search Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search invoice #, patient, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>

            <p className="text-xs text-slate-400 self-end sm:self-center">
              Showing <span className="font-semibold text-slate-700">{filteredBills.length}</span> invoices
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  {["Invoice #", "Patient", "Date", "Total", "Paid", "Balance", "Status", "Actions"].map((header) => (
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
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-xs sm:text-sm text-slate-400">
                      {isLoadingBills ? "Loading bills..." : "No billing records found."}
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => {
                    const balance = (Number(bill.amount) || 0) - (Number(bill.paidAmount) || 0);
                    return (
                      <tr key={bill._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                          {bill.invoiceNumber}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900">{bill.patient?.name || "-"}</p>
                          <p className="text-[10px] text-slate-400">Dr. {bill.doctor?.name || "N/A"}</p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {bill.date ? new Date(bill.date).toLocaleDateString() : "-"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-slate-900">
                          {formatRupees(bill.amount || 0)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-emerald-700">
                          {formatRupees(bill.paidAmount || 0)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600">
                          {formatRupees(balance)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStatus(bill)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${getStatusBadge(
                              bill.status
                            )}`}
                            title="Click to mark full payment"
                          >
                            {getStatusIcon(bill.status)}
                            <span>{bill.status}</span>
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => viewBillDetails(bill)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openBillForm(bill)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition"
                              title="Edit / Record Payment"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => printBill(bill)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                              title="Print Receipt"
                            >
                              <PrinterIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => confirmDelete(bill._id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Invoice"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100 p-2">
            {filteredBills.length > 0 ? (
              filteredBills.map((bill) => (
                <div key={bill._id} className="p-4 space-y-3 bg-white rounded-xl border border-slate-100 my-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900">#{bill.invoiceNumber}</span>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{bill.patient?.name || "-"}</p>
                    </div>

                    <button
                      onClick={() => toggleStatus(bill)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusBadge(
                        bill.status
                      )}`}
                    >
                      {bill.status}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Invoice</p>
                      <p className="font-bold text-slate-900">{formatRupees(bill.amount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Paid Amount</p>
                      <p className="font-bold text-emerald-700">{formatRupees(bill.paidAmount || 0)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => viewBillDetails(bill)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openBillForm(bill)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => printBill(bill)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => confirmDelete(bill._id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                {isLoadingBills ? "Loading bills..." : "No billing records found."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================= MODALS ======================= */}

      {/* Add / Edit Bill Modal */}
      {showBillForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingBill ? "Edit Invoice & Payments" : "Generate Patient Invoice"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowBillForm(false);
                  setEditingBill(null);
                  setPatientSuggestions([]);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveBill} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Patient <span className="text-rose-500">*</span>
                  </label>
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
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Doctor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={billFormValues.doctor || ""}
                    onChange={(e) => {
                      const doc = doctors.find((d) => d._id === e.target.value);
                      setBillFormValues({
                        ...billFormValues,
                        doctor: doc?._id,
                      });
                    }}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="10 digit phone"
                    value={billFormValues.contact || ""}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 10) val = val.slice(0, 10);
                      setBillFormValues({ ...billFormValues, contact: val });
                    }}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={billFormValues.date || ""}
                    onChange={(e) => setBillFormValues({ ...billFormValues, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    required
                  />
                </div>
              </div>

              {/* Services List */}
              <div className="border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Line Items & Medical Services
                </label>
                <div className="space-y-2">
                  {services.map((s, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Service / Treatment Name"
                        value={s.serviceName}
                        onChange={(e) => handleServiceChange(index, "serviceName", e.target.value)}
                        className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={s.quantity}
                        onChange={(e) => handleServiceChange(index, "quantity", e.target.value)}
                        className="w-16 px-2 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-center outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        min="0"
                        value={s.price}
                        onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                        className="w-24 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addService}
                  className="text-teal-600 hover:text-teal-800 text-xs font-semibold mt-2 inline-block cursor-pointer"
                >
                  + Add Item
                </button>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={billFormValues.paymentMethod || "Cash"}
                    onChange={(e) => setBillFormValues({ ...billFormValues, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online / UPI</option>
                  </select>
                </div>

                <div>
                  {editingBill ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Record New Payment
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter payment amount"
                        value={billFormValues.nextPayment}
                        onChange={(e) => setBillFormValues({ ...billFormValues, nextPayment: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Initial Paid Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={billFormValues.paidAmount}
                        onChange={(e) => setBillFormValues({ ...billFormValues, paidAmount: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Grand Total:</span>
                  <span className="font-bold text-slate-900">{formatRupees(computeTotal())}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Paid:</span>
                  <span className="font-bold text-emerald-700">
                    {formatRupees(
                      editingBill
                        ? Number(editingBill.paidAmount || 0) + Number(billFormValues.nextPayment || 0)
                        : Number(billFormValues.paidAmount || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                  <span>Remaining Balance:</span>
                  <span className="font-bold text-amber-700">
                    {formatRupees(
                      computeTotal() -
                        (editingBill
                          ? Number(editingBill.paidAmount || 0) + Number(billFormValues.nextPayment || 0)
                          : Number(billFormValues.paidAmount || 0))
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowBillForm(false);
                    setEditingBill(null);
                    setPatientSuggestions([]);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
                >
                  {isSaving ? "Saving..." : editingBill ? "Update Invoice" : "Save Invoice"}
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
              <h3 className="text-base font-bold text-slate-900">Delete Invoice Record?</h3>
              <p className="text-xs text-slate-500 mt-1">This action cannot be reversed.</p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteBillHandler}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Payment Confirmation Modal */}
      {showFullPaymentModal && fullPaymentBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Settle Full Payment</h3>
              <p className="text-xs text-slate-500 mt-1">
                Mark invoice <strong>#{fullPaymentBill.invoiceNumber}</strong> as Paid.
              </p>
            </div>

            <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Final Amount Collected</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fullPaymentAmount}
                onChange={(e) => setFullPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold"
              />
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowFullPaymentModal(false);
                  setFullPaymentBill(null);
                }}
                disabled={isProcessingFullPayment}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmFullPayment}
                disabled={isProcessingFullPayment}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                {isProcessingFullPayment ? "Saving..." : "Confirm Full Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📄</span> Invoice Summary #{selectedBill.invoiceNumber}
              </h3>
              <button onClick={closeBillDetails} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold uppercase">Patient</span>
                <span className="font-bold text-slate-900">{selectedBill.patient?.name || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold uppercase">Contact</span>
                <span className="font-semibold text-slate-800">
                  {(selectedBill.contact || selectedBill.contactNumber || "N/A").toString().slice(0, 10)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold uppercase">Doctor</span>
                <span className="font-semibold text-slate-800">Dr. {selectedBill.doctor?.name || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold uppercase">Date</span>
                <span>{selectedBill.date ? new Date(selectedBill.date).toLocaleDateString() : "-"}</span>
              </div>
              <div className="border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold uppercase block mb-1">Services</span>
                <p className="bg-slate-50 p-2 rounded-lg text-slate-800">{selectedBill.services || "N/A"}</p>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold uppercase">Total Amount</span>
                <span className="font-bold text-slate-900">{formatRupees(selectedBill.amount || 0)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-semibold uppercase">Total Paid</span>
                <span className="font-bold text-emerald-700">{formatRupees(selectedBill.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-semibold uppercase">Balance Due</span>
                <span className="font-bold text-amber-700">
                  {formatRupees((selectedBill.amount || 0) - (selectedBill.paidAmount || 0))}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={closeBillDetails}
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

export default BillingPage;