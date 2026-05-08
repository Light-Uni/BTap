const db = require("../config/db");

class User {
  static async findByUsername(username) {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, username, name, email, phone, address, role FROM users WHERE id = ?",
      [id],
    );
    return rows[0];
  }

  static async findAuthById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async findEmailOwner(email, excludeId) {
    const [rows] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [email, excludeId],
    );
    return rows[0];
  }

  static async updateProfile(id, { name, email, phone, address }) {
    await db.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
      [name, email, phone || null, address || null, id],
    );
  }

  static async updatePassword(id, hashedPassword) {
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
  }

  static async create({ username, password, name, email }) {
    await db.query(
      "INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)",
      [username, password, name, email],
    );
  }
}

module.exports = User;
