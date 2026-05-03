import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Icon } from "./UI";

const API_BASE = "http://localhost:3000/api";

function getHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function normalizeRole(role) {
  if (role === "MANAGER" || role === "manager") return "manager";
  if (role === "STOREKEEPER" || role === "store") return "store";
  if (role === "REQUESTER" || role === "pharmacist") return "pharmacist";
  return String(role || "").toLowerCase();
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function aggregateMedicines(rows, cabinetId) {
  const medicines = new Map();

  rows
    .filter((item) => item.position === cabinetId && Number(item.quantity) > 0)
    .forEach((item) => {
      const key = item.medicine_id;
      const current = medicines.get(key) || {
        medicineId: item.medicine_id,
        medicineName: item.medicine_name,
        quantity: 0,
        batches: [],
      };

      current.quantity += Number(item.quantity);
      current.batches.push(item);
      medicines.set(key, current);
    });

  return Array.from(medicines.values());
}

export default function CabinetModal({ cabinet, cabinetId, onClose, onRemoved }) {
  const role = normalizeRole(useSelector((state) => state.auth.user?.role));
  const resolvedCabinetId = cabinetId || cabinet?.key;
  const cabinetLabel = cabinet?.label || resolvedCabinetId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchCabinetMedicines() {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/inventory/map`, {
          headers: getHeaders(),
        });
        const data = aggregateMedicines(res.data, resolvedCabinetId);

        if (mounted) {
          setMedicines(data);
          setMedicineId(data[0]?.medicineId ? String(data[0].medicineId) : "");
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể tải danh sách thuốc trong tủ"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (resolvedCabinetId) {
      fetchCabinetMedicines();
    }

    return () => {
      mounted = false;
    };
  }, [resolvedCabinetId]);

  const selectedMedicine = useMemo(
    () => medicines.find((item) => String(item.medicineId) === String(medicineId)),
    [medicines, medicineId],
  );

  const submitLabel = role === "store" ? "Xác nhận bỏ thuốc" : "Gửi yêu cầu";

  async function handleSubmit(event) {
    event.preventDefault();

    if (!medicineId) {
      toast.error("Vui lòng chọn thuốc");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    if (selectedMedicine && Number(quantity) > selectedMedicine.quantity) {
      toast.error("Số lượng xoá vượt quá tồn kho trong tủ");
      return;
    }

    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(
        `${API_BASE}/warehouse/removal-requests`,
        {
          cabinetId: resolvedCabinetId,
          medicineId: Number(medicineId),
          quantity: Number(quantity),
          reason: reason.trim(),
        },
        { headers: getHeaders() },
      );

      toast.success(role === "store" ? "Đã xoá thuốc khỏi kho" : "Yêu cầu đã được gửi");
      onRemoved?.();
      onClose?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể gửi yêu cầu xoá thuốc"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="metric-card"
        style={{
          width: "min(520px, 100%)",
          maxHeight: "88vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
              Tủ thuốc
            </div>
            <h2 className="font-headline" style={{ fontSize: "1.35rem", fontWeight: 800 }}>
              {cabinetLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="btn btn-ghost"
            style={{ width: 36, height: 36, padding: 0, justifyContent: "center" }}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "var(--on-surface-variant)" }}>
            Đang tải danh sách thuốc...
          </div>
        ) : medicines.length === 0 ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "var(--on-surface-variant)" }}>
            Tủ này hiện chưa có thuốc để xoá.
          </div>
        ) : (
          <>
            <label style={{ display: "grid", gap: 8 }}>
              <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
                Chọn thuốc
              </span>
              <select
                className="wms-input"
                value={medicineId}
                onChange={(event) => {
                  setMedicineId(event.target.value);
                  setQuantity(1);
                }}
              >
                {medicines.map((medicine) => (
                  <option key={medicine.medicineId} value={medicine.medicineId}>
                    {medicine.medicineName} - còn {medicine.quantity}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
                Số lượng
              </span>
              <input
                className="wms-input"
                type="number"
                min="1"
                max={selectedMedicine?.quantity || undefined}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
                Lý do
              </span>
              <textarea
                className="wms-input"
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Nhập lý do bỏ thuốc khỏi kho"
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ justifyContent: "center", padding: "12px 18px" }}
            >
              <Icon name={role === "store" ? "delete" : "send"} size={18} />
              {submitting ? "Đang xử lý..." : submitLabel}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
