const express = require("express");
const db = require("../config/db");

const router = express.Router();

const CONFIRM_STATUSES = ["confirmed_full", "confirmed_partial", "rejected"];

function normalizeRole(role) {
  if (role === "REQUESTER" || role === "pharmacist") return "pharmacist";
  return String(role || "").toLowerCase();
}

function getUserId(req) {
  return req.user?.id || req.user?.userId || req.user?.user_id;
}

async function deductMedicineStock(connection, requestId, requestedItems, quantityMode) {
  const deductionPlan = [];
  let remainingPartialQuantity =
    quantityMode.type === "partial" ? quantityMode.actualQuantity : null;

  for (const item of requestedItems) {
    const requestedQuantity = Number(item.quantity);
    let quantityToDeduct = requestedQuantity;

    if (quantityMode.type === "partial") {
      if (remainingPartialQuantity <= 0) break;
      quantityToDeduct = Math.min(requestedQuantity, remainingPartialQuantity);
      remainingPartialQuantity -= quantityToDeduct;
    }

    const [batches] = await connection.query(
      `SELECT id, quantity
       FROM batches
       WHERE medicine_id = ?
         AND quantity > 0
         AND (expiry_date IS NULL OR expiry_date >= CURDATE())
       ORDER BY expiry_date ASC, created_at ASC, id ASC
       FOR UPDATE`,
      [item.medicine_id],
    );

    const available = batches.reduce((sum, batch) => sum + Number(batch.quantity), 0);
    if (available < quantityToDeduct) {
      const err = new Error(
        `Không đủ tồn kho cho thuốc ${item.medicine_name || item.medicine_id}`,
      );
      err.statusCode = 400;
      throw err;
    }

    let remaining = quantityToDeduct;
    for (const batch of batches) {
      if (remaining <= 0) break;

      const deductQuantity = Math.min(Number(batch.quantity), remaining);
      deductionPlan.push({
        medicineId: item.medicine_id,
        batchId: batch.id,
        quantity: deductQuantity,
      });
      remaining -= deductQuantity;
    }
  }

  for (const deduction of deductionPlan) {
    await connection.query(
      "UPDATE batches SET quantity = quantity - ? WHERE id = ?",
      [deduction.quantity, deduction.batchId],
    );

    await connection.query(
      `INSERT INTO inventory_logs
         (medicine_id, batch_id, change_amount, type, ref_id, ref_type, note)
       VALUES (?, ?, ?, 'EXPORT', ?, 'EXPORT_REQUEST', ?)`,
      [
        deduction.medicineId,
        deduction.batchId,
        -deduction.quantity,
        requestId,
        `Pharmacist confirm export request #${requestId}`,
      ],
    );
  }
}

async function getExportRequest(connection, requestId) {
  const [[request]] = await connection.query(
    `SELECT er.*, u.name AS requester_name, cu.name AS confirmed_by_name
     FROM export_requests er
     LEFT JOIN users u ON u.id = er.requester_id
     LEFT JOIN users cu ON cu.id = er.confirmed_by
     WHERE er.id = ?`,
    [requestId],
  );

  if (!request) return null;

  const [items] = await connection.query(
    `SELECT eri.*, m.name AS medicine_name
     FROM export_request_items eri
     JOIN medicines m ON m.id = eri.medicine_id
     WHERE eri.export_request_id = ?
     ORDER BY eri.id ASC`,
    [requestId],
  );

  request.items = items;
  return request;
}

router.put("/:id/confirm", async (req, res) => {
  const role = normalizeRole(req.user?.role);
  const confirmedBy = getUserId(req);
  const requestId = Number(req.params.id);
  const { status, actualQuantity, rejectionReason } = req.body;

  if (role !== "pharmacist") {
    return res.status(403).json({ message: "Chỉ dược sĩ mới được xác nhận yêu cầu xuất kho" });
  }

  if (!Number.isInteger(requestId) || requestId <= 0) {
    return res.status(400).json({ message: "Mã yêu cầu không hợp lệ" });
  }

  if (!CONFIRM_STATUSES.includes(status)) {
    return res.status(400).json({
      message: 'status phải là "confirmed_full", "confirmed_partial" hoặc "rejected"',
    });
  }

  const trimmedReason = typeof rejectionReason === "string" ? rejectionReason.trim() : "";
  const parsedActualQuantity = Number(actualQuantity);

  if (status === "rejected" && !trimmedReason) {
    return res.status(400).json({ message: "Lý do từ chối là bắt buộc" });
  }

  if (
    status === "confirmed_partial" &&
    (!Number.isInteger(parsedActualQuantity) || parsedActualQuantity <= 0)
  ) {
    return res.status(400).json({ message: "Số lượng thực tế phải lớn hơn 0" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const request = await getExportRequest(connection, requestId);
    if (!request) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy yêu cầu xuất kho" });
    }

    if (status !== "rejected") {
      await deductMedicineStock(connection, requestId, request.items, {
        type: status === "confirmed_partial" ? "partial" : "full",
        actualQuantity: parsedActualQuantity,
      });
    }

    const actualQuantityValue =
      status === "confirmed_full"
        ? request.items.reduce((sum, item) => sum + Number(item.quantity), 0)
        : status === "confirmed_partial"
          ? parsedActualQuantity
          : null;

    await connection.query(
      `UPDATE export_requests
       SET status = ?,
           actual_quantity = ?,
           rejection_reason = ?,
           confirmed_by = ?,
           confirmed_at = NOW()
       WHERE id = ?`,
      [
        status,
        actualQuantityValue,
        status === "rejected" ? trimmedReason : null,
        confirmedBy,
        requestId,
      ],
    );

    const updated = await getExportRequest(connection, requestId);
    await connection.commit();

    res.json(updated);
  } catch (err) {
    await connection.rollback();
    res.status(err.statusCode || 500).json({ message: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
