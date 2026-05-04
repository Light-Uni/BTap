const express = require("express");
const db = require("../config/db");

const router = express.Router();

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function getUserId(req) {
  return req.user?.id || req.user?.userId || req.user?.user_id;
}

function requireField(value, fieldName, res) {
  if (isBlank(value)) {
    res.status(400).json({ error: `Thiếu thông tin bắt buộc: ${fieldName}` });
    return false;
  }

  return true;
}

router.post("/", async (req, res) => {
  const { medicineId, quantity, supplierId, expectedDeliveryDate } = req.body;
  const notifiedBy = getUserId(req);
  const parsedMedicineId = Number(medicineId);
  const parsedSupplierId = Number(supplierId);
  const parsedQuantity = Number(quantity);

  if (!requireField(medicineId, "medicineId", res)) return;
  if (!requireField(quantity, "quantity", res)) return;
  if (!requireField(supplierId, "supplierId", res)) return;
  if (!requireField(expectedDeliveryDate, "expectedDeliveryDate", res)) return;
  if (!requireField(notifiedBy, "notifiedBy", res)) return;

  if (!Number.isInteger(parsedMedicineId) || parsedMedicineId <= 0) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc: medicineId" });
  }

  if (!Number.isInteger(parsedSupplierId) || parsedSupplierId <= 0) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc: supplierId" });
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ error: "Số lượng phải lớn hơn 0" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO import_notifications
        (medicine_id, quantity, supplier_id, expected_delivery_date, notified_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        parsedMedicineId,
        parsedQuantity,
        parsedSupplierId,
        expectedDeliveryDate,
        notifiedBy,
      ],
    );

    const [[notification]] = await db.query(
      `SELECT
         id,
         medicine_id AS medicineId,
         quantity,
         supplier_id AS supplierId,
         expected_delivery_date AS expectedDeliveryDate,
         notified_by AS notifiedBy,
         created_at AS createdAt
       FROM import_notifications
       WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
