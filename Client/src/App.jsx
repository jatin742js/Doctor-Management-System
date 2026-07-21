import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/pages/Login";
import Register from "./Components/pages/Register";
import ForgotPassword from "./Components/pages/ForgotPassword";
import Sidebar from "./Components/common/SideBar";
import Dashboard from "./Components/pages/Dashboard";
import Patients from "./Components/pages/Patients";
import Appointments from "./Components/pages/Appointment";
import Settings from "./Components/pages/Settings";
import Billing from "./Components/pages/Billing";
import Doctors from "./Components/pages/Doctors";
import Prescriptions from "./Components/pages/Prescriptions";
import Reports from "./Components/pages/Reports";
import AddPatient from "./Components/pages/Addpatient";
import Addappointment from "./Components/pages/Addappointment";
import AddPrescription from "./Components/pages/Addprescription";
// import Newinvoice from "./Components/pages/Newinvoice";
// import Addreport from "./Components/pages/Addreport";
// import EditInvoice from "./Components/pages/Edit-invoice";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default → Login page */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected pages with Sidebar layout */}
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/add" element={<AddPatient />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/add" element={<Addappointment />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/prescriptions/add" element={<AddPrescription />} />
          <Route path="/billing" element={<Billing />} />
          {/* <Route path="/billing/new" element={<Newinvoice />} /> */}
          {/* <Route path="/billing/edit/:id" element={<EditInvoice />} /> */}
          <Route path="/reports" element={<Reports />} />
          {/* <Route path="/reports/add" element={<Addreport />} /> */}
          <Route path="/doctor" element={<Doctors />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
