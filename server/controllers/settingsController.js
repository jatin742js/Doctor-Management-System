const Setting = require("../models/setting");

// GET user settings
exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ from JWT
    let setting = await Setting.findOne({ userId });

    if (!setting) {
      setting = await Setting.create({
        clinicName: "My Clinic ERP",
        userId,
      });
    }

    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// UPDATE user settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ from JWT
    const {
      ClinicName, Address, Phone, Email, open, close,
      slotDuration, maxPatientsPerDay, currency, taxPercent,
      invoicePrefix, enableSMS, enableEmail, reminderBefore,
      darkMode, language
    } = req.body;

    let setting = await Setting.findOne({ userId }) || new Setting({ userId });

    setting.clinicName = ClinicName;
    setting.address = Address;
    setting.phone = Phone;
    setting.email = Email;
    setting.workingHours = { open, close };
    setting.appointment = { slotDuration, maxPatientsPerDay };
    setting.billing = { currency, taxPercent, invoicePrefix };
    setting.notification = { enableSMS: !!enableSMS, enableEmail: !!enableEmail, reminderBefore };
    setting.theme = { darkMode: !!darkMode, language };
    setting.updatedAt = Date.now();

    await setting.save();

    res.json({ message: "Settings updated successfully!", setting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating settings" });
  }
};
