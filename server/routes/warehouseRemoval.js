const express = require("express");
const db = require("../config/db");

const router = express.Router();

const ROLE_MAP = {
  MANAGER: "manager",
  manager: "manager",
  STOREKEEPER: "store",
  store: "store",
  REQUESTER: "pharmacist",
  pharmacist: "pharmacist",
};

function normalizeRole(role) {
  return ROLE_MAP[role] || String(role || "").toLowerCase();
}

function getRequestedBy(req) {
  return req.user?.id || req.user?.userId || req.user?.user_id;
}

async function deductStock(connection, { cabinetId, medicineId, quantity }) {
  const [batches] = await connection.query(
    `SELECT id, quantity
     FROM batches
     WHERE position = ?
       AND medicine_id = ?
       AND quantity > 0
     ORDER BY expiry_date ASC, created_at ASC, id ASC
     FOR UPDATE`,
    [cabinetId, medicineId],
  );

  const available = batches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
  if (available < quantity) {
    const err = new Error("Số lượng trong tủ không đủ để xoá");
    err.statusCode = 400;
    throw err;
  }

  let remaining = quantity;
  for (const batch of batches) {
    if (remaining <= 0) break;

    const currentQuantity = Number(batch.quantity);
    const deductQuantity = Math.min(currentQuantity, remaining);

    await connection.query(
      "UPDATE batches SET quantity = quantity - ? WHERE id = ?",
      [deductQuantity, batch.id],
    );

    remaining -= deductQuantity;
  }
}

router.post("/removal-requests", async (req, res) => {
  const { cabinetId, medicineId, quantity, reason } = req.body;
  const requestedBy = getRequestedBy(req);
  const role = normalizeRole(req.user?.role);
  const parsedMedicineId = Number(medicineId);
  const parsedQuantity = Number(quantity);
  const trimmedReason = typeof reason === "string" ? reason.trim() : "";

  if (
    !cabinetId ||
    !Number.isInteger(parsedMedicineId) ||
    parsedMedicineId <= 0 ||
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity <= 0 ||
    !trimmedReason
  ) {
    return res.status(400).json({
      message: "cabinetId, medicineId, quantity (> 0), reason là bắt buộc",
    });
  }

  if (!requestedBy) {
    return res.status(401).json({ message: "Không xác định được người dùng" });
  }

  if (!["manager", "store"].includes(role)) {
    return res.status(403).json({ message: "Bạn không có quyền tạo yêu cầu xoá thuốc" });
  }

  const status = role === "store" ? "completed" : "pending";
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    if (role === "store") {
      await deductStock(connection, {
        cabinetId,
        medicineId: parsedMedicineId,
        quantity: parsedQuantity,
      });
    }

    const [result] = await connection.query(
      `INSERT INTO warehouse_removal_requests
        (cabinet_id, medicine_id, quantity, reason, requested_by, requester_role, status, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cabinetId,
        parsedMedicineId,
        parsedQuantity,
        trimmedReason,
        requestedBy,
        role,
        status,
        status === "completed" ? new Date() : null,
      ],
    );

    await connection.commit();

    res.status(201).json({
      message: status === "completed" ? "Đã xoá thuốc khỏi kho" : "Yêu cầu đã được gửi",
      id: result.insertId,
      status,
    });
  } catch (err) {
    await connection.rollback();
    res.status(err.statusCode || 500).json({ message: err.message });
  } finally {
    connection.release();
  }
});

router.get("/removal-requests", async (req, res) => {
  const status = req.query.status ? String(req.query.status).toLowerCase() : null;

  if (status && !["pending", "completed", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    const params = [];
    let whereClause = "";

    if (status) {
      whereClause = "WHERE wr.status = ?";
      params.push(status);
    }

    const [rows] = await db.query(
      `SELECT
         wr.id,
         wr.medicine_id AS medicineId,
         m.name AS medicine,
         wr.cabinet_id AS cabinetId,
         wr.cabinet_id AS cabinet,
         wr.quantity,
         wr.reason,
         wr.requested_by AS requestedById,
         u.name AS requestedBy,
         wr.requester_role AS requesterRole,
         wr.status,
         wr.created_at AS createdAt,
         wr.completed_at AS completedAt
       FROM warehouse_removal_requests wr
       JOIN medicines m ON m.id = wr.medicine_id
       LEFT JOIN users u ON u.id = wr.requested_by
       ${whereClause}
       ORDER BY wr.created_at DESC`,
      params,
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
