const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const db = require("../config/db");
const User = require("../models/user.model");
const { sendResetEmail } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { username, name, email, password } = req.body;

  try {
    const trimmedUsername = username?.trim();
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();

    if (!trimmedUsername || !trimmedName || !trimmedEmail || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findByUsername(trimmedUsername);

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findByEmail(trimmedEmail);

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username: trimmedUsername,
      password: hashedPassword,
      name: trimmedName,
      email: trimmedEmail,
    });

    res.json({ message: "Register success" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const trimmedEmail = email?.trim();

  try {
    if (!trimmedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [trimmedEmail]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Email not found" });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_exp = ? WHERE id = ?",
      [token, expireTime, user.id],
    );

    await sendResetEmail(user.email, token);

    res.json({ message: "Reset password email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ message: "Thiếu liên kết hoặc mật khẩu mới" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_exp > NOW()",
      [token],
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email mới." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_exp = NULL WHERE id = ?",
      [hashedPassword, users[0].id],
    );

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
