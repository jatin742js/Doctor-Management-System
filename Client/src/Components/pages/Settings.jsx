import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock3,
  CalendarDays,
  Wallet,
  Globe,
  Save,
  Hospital,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../../store/services/settingsApi";

export default function Settings() {
  const { data: settingsData, isLoading: loading, refetch } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
  const [, setSetting] = useState({});
  const [formValues, setFormValues] = useState({});
  const [message, setMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // normalize server keys (accept CamelCase or camelCase)
  const normalizeSettings = (raw = {}) => ({
    clinicName: raw.clinicName || raw.ClinicName || "",
    address: raw.address || raw.Address || "",
    email: raw.email || raw.Email || "",
    phone: raw.phone || raw.Phone || "",
    workingHours: {
      open: raw.workingHours?.open || raw.open || "",
      close: raw.workingHours?.close || raw.close || "",
    },
    appointment: {
      slotDuration: raw.appointment?.slotDuration || raw.slotDuration || 30,
      maxPatientsPerDay: raw.appointment?.maxPatientsPerDay || raw.maxPatientsPerDay || 50,
      dailyAppointmentsLimit: raw.appointment?.dailyAppointmentsLimit || raw.dailyAppointmentsLimit || 0,
    },
    billing: {
      currency: raw.billing?.currency || raw.currency || "",
      taxPercent: raw.billing?.taxPercent || raw.taxPercent || 0,
      invoicePrefix: raw.billing?.invoicePrefix || raw.invoicePrefix || "INV-",
    },
    // notification: {
    //   enableSMS: raw.notification?.enableSMS ?? raw.enableSMS ?? false,
    //   enableEmail: raw.notification?.enableEmail ?? raw.enableEmail ?? false,
    //   reminderBefore: raw.notification?.reminderBefore || raw.reminderBefore || 24,
    // },
    theme: {
      language: raw.theme?.language || raw.language || "en",
      darkMode: raw.theme?.darkMode ?? raw.darkMode ?? false,
    },
    _raw: raw,
  });

  // Fetch settings from RTK Query
  useEffect(() => {
    if (settingsData) {
      const raw = settingsData.setting || settingsData;
      const s = normalizeSettings(raw);
      setSetting(s);
      setFormValues({
        clinicName: s.clinicName || "",
        address: s.address || "",
        email: s.email || "",
        phone: s.phone || "",
        workingHours: s.workingHours || { open: "", close: "" },
        appointment: s.appointment || { slotDuration: 30, maxPatientsPerDay: 50 },
        billing: s.billing || { currency: "", taxPercent: 0, invoicePrefix: "INV-" },
        // notification: s.notification || { enableSMS: false, enableEmail: false, reminderBefore: 24 },
        theme: s.theme || { language: "en", darkMode: false },
      });
    }
  }, [settingsData]);

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const fv = formValues;
    const payload = {
      ClinicName: fv.clinicName,
      Address: fv.address,
      Email: fv.email,
      Phone: fv.phone,
      open: fv.workingHours?.open,
      close: fv.workingHours?.close,
      slotDuration: Number(fv.appointment?.slotDuration || 30),
      maxPatientsPerDay: Number(fv.appointment?.maxPatientsPerDay || 50),
      currency: fv.billing?.currency,
      taxPercent: Number(fv.billing?.taxPercent || 0),
      invoicePrefix: fv.billing?.invoicePrefix,
      // enableSMS: !!fv.notification?.enableSMS,
      // enableEmail: !!fv.notification?.enableEmail,
      // reminderBefore: Number(fv.notification?.reminderBefore || 24),
      darkMode: !!fv.theme?.darkMode,
      language: fv.theme?.language,
    };
    try {
      const res = await updateSettings(payload).unwrap();
      refetch();
      setMessage(res.message || "Settings updated successfully!");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2000);
    } catch (err) {
      console.error("Settings update error:", err);
      alert(err?.data?.error || "Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-teal-100 p-8 flex items-center justify-center">
        <div className="text-gray-700 text-lg">Loading settings...</div>
      </div>
    );
  }

 return (
    <div className="min-h-screen w-full bg-slate-50/60 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Hospital className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold text-gray-800"> Settings</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hidden sm:inline">Manage your clinic preferences</span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-8">
          {/* Clinic Details */}
          <section className="bg-white  shadow-xl p-6 md:p-8 border border-gray-100 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
              <Building2 className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-semibold text-gray-800">Clinic Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
                <input
                  type="text"
                  value={formValues.clinicName || ""}
                  onChange={(e) => setFormValues({ ...formValues, clinicName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formValues.address || ""}
                  onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-cyan-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formValues.email || ""}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formValues.phone || ""}
                  onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
          </section>

          {/* Working Hours */}
          <section className="bg-white  shadow-xl p-6 md:p-8 border border-gray-100 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
              <Clock3 className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-semibold text-gray-800">Working Hours</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={formValues.workingHours?.open || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      workingHours: { ...formValues.workingHours, open: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={formValues.workingHours?.close || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      workingHours: { ...formValues.workingHours, close: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
          </section>

          {/* Appointments */}
          <section className="bg-white  shadow-xl p-6 md:p-8 border border-gray-100 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
              <CalendarDays className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-semibold text-gray-800">Appointment Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (min)</label>
                <input
                  type="number"
                  value={formValues.appointment?.slotDuration ?? 30}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      appointment: { ...formValues.appointment, slotDuration: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients / Day</label>
                <input
                  type="number"
                  value={formValues.appointment?.maxPatientsPerDay ?? 50}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      appointment: { ...formValues.appointment, maxPatientsPerDay: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Appointments Limit</label>
                <input
                  type="number"
                  value={formValues.appointment?.dailyAppointmentsLimit ?? 0}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      appointment: { ...formValues.appointment, dailyAppointmentsLimit: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
          </section>

          
         

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
}