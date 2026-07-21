import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/dashboard", icon: <HomeIcon className="h-5 w-5" />, label: "Dashboard" },
    { to: "/patients", icon: <UsersIcon className="h-5 w-5" />, label: "Patients" },
    { to: "/appointments", icon: <CalendarDaysIcon className="h-5 w-5" />, label: "Appointments" },
    { to: "/prescriptions", icon: <DocumentTextIcon className="h-5 w-5" />, label: "Prescriptions" },
    { to: "/billing", icon: <CurrencyDollarIcon className="h-5 w-5" />, label: "Billing" },
    { to: "/reports", icon: <ChartBarIcon className="h-5 w-5" />, label: "Reports" },
    { to: "/doctor", icon: <UserCircleIcon className="h-5 w-5" />, label: "Doctors" },
    { to: "/settings", icon: <Cog6ToothIcon className="h-5 w-5" />, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50/60 antialiased text-slate-800">
      {/* 🔹 Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between z-40 shadow-xs">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Mobile Logo Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            SmartHealthCare
          </span>
        </div>

        <div className="w-9" /> {/* Spacer to balance burger icon */}
      </div>

      {/* 🔹 Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* 🔹 Main Sidebar */}
      <aside
        className={`bg-white text-slate-600 border-r border-slate-200/80 p-5 flex flex-col justify-between z-50
          fixed top-0 left-0 h-full w-[260px]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header & Logo Section */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Healthcare Symbol (Caduceus/Cross Pulse Icon) */}
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  SmartHealthCare
                </h2>
                <p className="text-[11px] font-medium text-slate-400 mt-1">
                  Health System Platform
                </p>
              </div>
            </div>

            {/* Mobile Drawer Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="flex flex-col space-y-1.5 flex-grow overflow-y-auto pr-1 scrollbar-none">
            <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-teal-50 text-teal-700 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={isActive ? "text-teal-600" : "text-slate-400"}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User / Logout Action Footer */}
          <div className="pt-4 border-t border-slate-100 mt-auto">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors w-full"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Log Out</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 🔹 Content Area */}
      <main className="flex-1 md:ml-[260px] pt-16 md:pt-0 overflow-y-auto bg-slate-50/60 min-h-screen w-full">
        <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}