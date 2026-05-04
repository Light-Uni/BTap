const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/disposals/expired-batches ← danh sách lô đã hết hạn
router.get("/expired-batches", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.batch_code,
        b.quantity,
        b.expiry_date,
        b.position,
        m.id AS medicine_id,
        m.name AS medicine_name
      FROM batches b
      JOIN medicines m ON m.id = b.medicine_id
      WHERE b.expiry_date < NOW()
        AND b.quantity > 0
      ORDER BY b.expiry_date ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/disposals ← thực hiện tiêu huỷ lô
router.post("/", async (req, res) => {
  const { batch_id, quantity, reason } = req.body;
  const created_by = req.user.id;

  if (!batch_id || !quantity) {
    return res.status(400).json({ message: "Thiếu thông tin tiêu huỷ" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Kiểm tra lô hàng
    const [batches] = await conn.query("SELECT * FROM batches WHERE id = ?", [batch_id]);
    if (batches.length === 0) {
      throw new Error("Lô hàng không tồn tại");
    }
    const batch = batches[0];
    if (batch.quantity < quantity) {
      throw new Error("Số lượng tiêu huỷ vượt quá số lượng trong lô");
    }

    // 2. Ghi vào bảng disposals
    const [result] = await conn.query(
      "INSERT INTO disposals (batch_id, medicine_id, quantity, reason, created_by) VALUES (?, ?, ?, ?, ?)",
      [batch_id, batch.medicine_id, quantity, reason, created_by]
    );
    const disposalId = result.insertId;

    // 3. Cập nhật số lượng trong batches
    await conn.query("UPDATE batches SET quantity = quantity - ? WHERE id = ?", [quantity, batch_id]);

    // 4. Ghi vào inventory_logs
    await conn.query(
      "INSERT INTO inventory_logs (medicine_id, batch_id, change_amount, type, ref_id, ref_type, note) VALUES (?, ?, ?, 'DISPOSE', ?, 'DISPOSAL', ?)",
      [batch.medicine_id, batch_id, -quantity, disposalId, reason]
    );

    await conn.commit();
    res.json({ message: "Tiêu huỷ lô thuốc thành công", disposalId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/disposals/history ← lịch sử tiêu huỷ
router.get("/history", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.quantity,
        d.reason,
        d.created_at,
        m.name AS medicine_name,
        b.batch_code,
        u.name AS created_by_name
      FROM disposals d
      JOIN medicines m ON m.id = d.medicine_id
      JOIN batches b ON b.id = d.batch_id
      JOIN users u ON u.id = d.created_by
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
