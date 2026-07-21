const mongoose = require("mongoose");
const Invoice = require("../models/invoices");
const Appointment = require("../models/appointment");
const Patient = require("../models/patients");
const Doctor = require("../models/doctor");
const Report = require("../models/report");

exports.getDashboard = async (req, res) => {
  const defaultResponse = {
    username: "User",
    monthlyRevenue: 0,
    todayRevenue: 0,
    todayAppointments: 0,
    newPatients: 0,
    doctorsActive: 0,
    revenueData: [],
    notifications: [],
    upcomingAppointments: [],
  };

  try {
    // ✅ Extract userId from verified JWT
    const userIdStr = req.user?.userId;
    if (!userIdStr)
      return res.status(401).json({ message: "Unauthorized", ...defaultResponse });

    const userId = new mongoose.Types.ObjectId(userIdStr);
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    // start of 7-day window (including today)
    const startOf7Days = new Date(now);
    startOf7Days.setDate(now.getDate() - 6);
    startOf7Days.setHours(0, 0, 0, 0);

    // --- Revenue aggregation ---
    // todayRevenue: sums todayPaidAmount for invoices where todayPaidDate is today
    // monthlyRevenue: sums paidAmount from all invoices updated in current month
    // revenueData: groups by day using updatedAt for historical data
    const revenueAgg = await Invoice.aggregate([
      { $match: { userId } },
      {
        $facet: {
          monthlyRevenue: [
            { $match: { updatedAt: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: { $ifNull: ["$paidAmount", 0] } } } },
          ],
          // Build daily revenue series for last 7 days from paymentHistory entries
          revenueData: [
            { $project: { paymentHistory: 1, userId: 1 } },
            { $match: { userId } },
            { $unwind: "$paymentHistory" },
            {
              $match: {
                "paymentHistory.date": { $gte: startOf7Days, $lte: endOfDay }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentHistory.date" } },
                revenue: { $sum: { $ifNull: ["$paymentHistory.amount", 0] } },
              }
            },
            { $sort: { _id: 1 } },
          ],
          todayMetrics: [
            {
              $match: {
                todayPaidDate: { $gte: startOfDay, $lte: endOfDay },
              },
            },
            {
              $group: {
                _id: null,
                todayRevenue: { $sum: { $ifNull: ["$todayPaidAmount", 0] } },
              },
            },
          ],
        },
      },
    ]);

    const monthlyRevenue = revenueAgg[0].monthlyRevenue.length
      ? revenueAgg[0].monthlyRevenue[0].total
      : 0;

    const revenueData = (revenueAgg[0].revenueData || []).map((item) => {
      const dateObj = new Date(item._id);
      return {
        date: `${dateObj.getDate()} ${dateObj.toLocaleString("default", { month: "short" })}`,
        revenue: item.revenue,
      };
    });

    const todayRevenue = revenueAgg[0].todayMetrics.length
      ? revenueAgg[0].todayMetrics[0].todayRevenue
      : 0;

    // --- Today appointments ---
    const todayAppointments = await Appointment.countDocuments({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // --- New patients today ---
    const newPatients = await Patient.countDocuments({
      userId,
      visiteddate: { $gte: startOfDay, $lte: endOfDay },
    });

    // --- Active doctors ---
    const doctorsActive = await Doctor.countDocuments({ userId, isActive: true });

    // --- Notifications (latest 5 reports) ---
    const recentReports = await Report.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const notifications = recentReports
      .filter(r => !r.read) // only unread
      .map((r) => ({
        id: r._id,
        message: `Report "${r.title}" was ${r.fileUrl ? "updated/uploaded" : "created"}`,
        time: r.updatedAt ? r.updatedAt.toLocaleTimeString() : "Just now",
        read: r.read || false,
      }));


    // --- Upcoming appointments ---
    const upcomingAppointments = await Appointment.find({
      userId,
      date: { $gte: now },
    })
      .sort({ date: 1 })
      .limit(5)
      .populate("patient", "name")
      .populate("doctor", "name")
      .select("patient doctor date time status")
      .lean();

    res.json({
      username: req.user?.username || "User",
      monthlyRevenue,
      todayRevenue,
      todayAppointments,
      newPatients,
      doctorsActive,
      revenueData,
      notifications,
      upcomingAppointments,
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).json(defaultResponse);
  }
};
