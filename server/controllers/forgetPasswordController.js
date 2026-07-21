const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.apiForgetPassword = async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;

  try {
    // Check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "❌ Passwords do not match.",
      });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ Username not found.",
      });
    }

    // Update password (will auto-hash from schema)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "✅ Password updated successfully!",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      success: false,
      message: "⚠️ Server error. Try again later.",
    });
  }
};
