const bcrypt = require("bcryptjs");

const User = require("../models/user.model");

exports.get = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();

    if (!trimmedName || !trimmedEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailOwner = await User.findEmailOwner(trimmedEmail, req.user.id);

    if (emailOwner) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await User.updateProfile(req.user.id, {
      name: trimmedName,
      email: trimmedEmail,
      phone: phone?.trim(),
      address: address?.trim(),
    });

    const updatedUser = await User.findById(req.user.id);

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findAuthById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.id, hashedPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
