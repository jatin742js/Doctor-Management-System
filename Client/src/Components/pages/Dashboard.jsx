import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from "chart.js";
import { useGetDashboardQuery, useMarkReportReadMutation } from "../../store/services/dashboardApi";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler, ArcElement);

export default function Dashboard() {
  const { data: dashboardData, isLoading: loading, refetch } = useGetDashboardQuery();
  const [markReportRead] = useMarkReportReadMutation();
  const stats = {
    username: dashboardData?.username || "User",
    todayAppointments: dashboardData?.todayAppointments || 0,
    newPatients: dashboardData?.newPatients || 0,
    monthlyRevenue: Number(dashboardData?.monthlyRevenue) || 0,
    todayRevenue: Number(dashboardData?.todayRevenue) || 0,
    doctorsActive: dashboardData?.doctorsActive || 0,
  };
  const revenueData = dashboardData?.revenueData || [];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  useEffect(() => {
    if (dashboardData) {
      setNotifications(dashboardData.notifications || []);
      setUpcomingAppointments(dashboardData.upcomingAppointments || []);
    }
  }, [dashboardData]);

  const revenueChartData = {
    labels: revenueData.map((item) => item.date),
    datasets: [
        {
          label: "Paid Revenue",
          data: revenueData.map((item) => item.revenue),
        borderColor: "#2563eb", // soft professional blue
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(37, 99, 235, 0.25)");
          gradient.addColorStop(1, "rgba(37, 99, 235, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#1d4ed8",
        shadowColor: "rgba(37, 99, 235, 0.4)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: (context) => `₹${context.raw}`,
        },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
        },
      },
      y: {
        grid: {
          color: "rgba(229, 231, 235, 0.4)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          callback: (value) => `₹${value}`,
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeInOutQuart",
    },
  };


  const filterData = () => {
    setFilterLoading(true);
    setTimeout(() => {
      alert(`Filter applied from ${startDate} to ${endDate}`);
      setFilterLoading(false);
    }, 1000);
  };



  const markNotificationAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, fading: true } : n
        )
      );
      await markReportRead(id).unwrap();
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        refetch();
      }, 300);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, fading: false } : n
        )
      );
    }
  };

  const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[380px] animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-64 bg-gray-100 rounded"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 text-slate-800">
      {/* Top Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Clinical Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Welcome back, <span className="font-semibold text-slate-700">{stats.username}</span>
          </p>
        </div>
        <div className="text-xs font-medium bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-slate-600 self-start sm:self-auto">
          📅 {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </div>
      </header>

      {/* Metrics Section */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        {loading
          ? Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          : [
              {
                title: "Today's Appointments",
                value: stats.todayAppointments,
                icon: (
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                iconBg: "bg-teal-50",
                trend: "+12%",
              },
              {
                title: "Today's Revenue",
                value: `₹${stats.todayRevenue.toLocaleString()}`,
                icon: (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                iconBg: "bg-emerald-50",
                trend: "+8%",
              },
              {
                title: "Monthly Revenue",
                value: `₹${stats.monthlyRevenue.toLocaleString()}`,
                icon: (
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                iconBg: "bg-sky-50",
                trend: "+15%",
              },
              {
                title: "New Patients",
                value: stats.newPatients,
                icon: (
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                iconBg: "bg-indigo-50",
                trend: "+5%",
              },
              {
                title: "Active Doctors",
                value: stats.doctorsActive,
                icon: (
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                iconBg: "bg-rose-50",
                trend: "100%",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {card.trend}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
              </div>
            ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Analytics Chart & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Analytics & Revenue
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Filter trends across custom date ranges</p>
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
                <button
                  onClick={filterData}
                  disabled={filterLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {filterLoading ? "Filtering..." : "Apply"}
                </button>
              </div>
            </div>

            {/* Chart Container */}
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4 pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Paid Revenue (Last 7 Days)
                  </span>
                  <span className="text-xs text-slate-400">Live updating</span>
                </div>
                <div className="h-[340px] w-full">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notifications & Upcoming Appointments */}
        <div className="flex flex-col gap-6">
          {/* Notifications / Uploaded Reports */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>📑</span> Reports & Notifications
              </h2>
              {notifications.length > 0 && (
                <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No new updates or reports</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      n.read
                        ? "bg-slate-50/60 border-slate-100"
                        : "bg-sky-50/50 border-sky-100/80 shadow-2xs"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-xs ${n.read ? "text-slate-600" : "text-slate-900 font-medium"}`}>
                        {n.message}
                      </p>
                      {!n.read && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="text-teal-600 hover:text-teal-800 text-xs font-medium whitespace-nowrap bg-teal-50 px-2 py-1 rounded-md transition"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-xs">
            <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <span>🩺</span> Upcoming Appointments
            </h2>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {upcomingAppointments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No upcoming appointments</p>
              ) : (
                upcomingAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {app.patient?.name || app.patient}
                      </p>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>👨‍⚕️ Dr. {app.doctor?.name}</span>
                        <span>•</span>
                        <span>{app.time}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(app.date).toLocaleDateString()}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide uppercase shrink-0 ${
                        app.status === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}