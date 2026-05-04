import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Icon } from "./UI";
import { setCabinetFull } from "../api/inventoryMapApi";

const API_BASE = "http://localhost:3000/api";

function getHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function aggregateMedicines(rows, cabinetId) {
  return rows
    .filter((item) => item.position === cabinetId && Number(item.quantity) > 0)
    .map((item) => ({
      id: item.id,
      medicineId: item.medicine_id,
      medicineName: item.medicine_name,
      batchCode: item.batch_code,
      quantity: item.quantity,
      expiryDate: item.expiry_date,
    }));
}

export default function CabinetModal({ cabinet, cabinetId, onClose, onRemoved }) {
  const resolvedCabinetId = cabinetId || cabinet?.key;
  const cabinetLabel = cabinet?.label || resolvedCabinetId;

  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [isFull, setIsFull] = useState(cabinet?.isFull || false);

  const user = useSelector((state) => state.auth.user);
  const isStorekeeper = user?.role === "STOREKEEPER";

  useEffect(() => {
    setIsFull(cabinet?.isFull || false);
  }, [cabinet]);

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

  async function handleToggleFull() {
    const newVal = !isFull;
    try {
      await setCabinetFull(resolvedCabinetId, newVal);
      setIsFull(newVal);
      toast.success(newVal ? "Đã đánh dấu tủ đầy" : "Đã bỏ đánh dấu tủ đầy");
      onRemoved?.(); 
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể cập nhật trạng thái tủ"));
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
      <div
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isStorekeeper && (
              <button
                type="button"
                className={`btn ${isFull ? "btn-danger" : "btn-secondary"}`}
                onClick={handleToggleFull}
                style={{ padding: "6px 12px", fontSize: "0.8rem" }}
              >
                <Icon name={isFull ? "lock" : "lock_open"} size={16} />
                {isFull ? "Tủ đã đầy" : "Đánh dấu tủ đầy"}
              </button>
            )}
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
        </div>

        {loading ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "var(--on-surface-variant)" }}>
            Đang tải danh sách thuốc...
          </div>
        ) : medicines.length === 0 ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "var(--on-surface-variant)" }}>
            Tủ này hiện chưa có thuốc.
          </div>
        ) : (
          <table className="wms-table">
            <thead>
              <tr>
                <th>Tên thuốc</th>
                <th>Mã lô</th>
                <th>Số lượng</th>
                <th>Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine, index) => (
                <tr key={medicine.id || index}>
                  <td style={{ fontWeight: 600 }}>{medicine.medicineName}</td>
                  <td>{medicine.batchCode || "—"}</td>
                  <td style={{ fontWeight: 700 }}>{medicine.quantity}</td>
                  <td style={{ color: "var(--primary)", fontWeight: 600 }}>
                    {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString("vi-VN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
