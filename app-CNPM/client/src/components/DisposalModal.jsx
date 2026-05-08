import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Icon, EmptyState } from "./UI";
import { API_BASE_URL } from "../constants/api";

const API_BASE = API_BASE_URL;

function getHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export default function DisposalModal({ onClose, onSuccess }) {
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchExpired() {
      try {
        const res = await axios.get(`${API_BASE}/disposals/expired-batches`, {
          headers: getHeaders(),
        });
        setExpiredBatches(res.data);
      } catch (error) {
        toast.error("Không thể tải danh sách lô hết hạn");
      } finally {
        setLoading(false);
      }
    }
    fetchExpired();
  }, []);

  async function handleDispose() {
    if (!selectedBatch) {
      toast.warning("Vui lòng chọn lô cần tiêu huỷ");
      return;
    }
    if (quantity <= 0 || quantity > selectedBatch.quantity) {
      toast.warning("Số lượng không hợp lệ");
      return;
    }
    if (!reason.trim()) {
      toast.warning("Vui lòng nhập lý do tiêu huỷ");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/disposals`,
        {
          batch_id: selectedBatch.id,
          quantity,
          reason,
        },
        { headers: getHeaders() }
      );
      toast.success("Tiêu huỷ lô thuốc thành công");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tiêu huỷ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box wms-form" style={{ width: "min(600px, 95vw)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 className="font-headline" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Tiêu huỷ lô thuốc hết hạn</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)" }}>Chọn lô đã hết hạn để thực hiện tiêu huỷ</p>
          </div>
          <button className="btn btn-ghost" style={{ padding: 4 }} onClick={onClose}>
            <Icon name="close" size={24} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>Đang tải danh sách lô hết hạn...</div>
        ) : expiredBatches.length === 0 ? (
          <EmptyState icon="auto_delete" message="Không có lô thuốc nào đã hết hạn cần tiêu huỷ" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ maxHeight: "30vh", overflowY: "auto", border: "1px solid var(--outline-variant)", borderRadius: 12 }}>
              <table className="wms-table">
                <thead>
                  <tr>
                    <th>Chọn</th>
                    <th>Thuốc</th>
                    <th>Mã lô</th>
                    <th>Tồn</th>
                    <th>HSD</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredBatches.map((b) => (
                    <tr 
                      key={b.id} 
                      onClick={() => {
                        setSelectedBatch(b);
                        setQuantity(b.quantity);
                      }}
                      style={{ cursor: "pointer", background: selectedBatch?.id === b.id ? "var(--surface-container-high)" : "transparent" }}
                    >
                      <td>
                        <input type="radio" checked={selectedBatch?.id === b.id} readOnly />
                      </td>
                      <td style={{ fontWeight: 600 }}>{b.medicine_name}</td>
                      <td>{b.batch_code}</td>
                      <td style={{ fontWeight: 700 }}>{b.quantity}</td>
                      <td style={{ color: "var(--error)", fontWeight: 600 }}>
                        {new Date(b.expiry_date).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedBatch && (
              <div className="metric-card animate-fade-in" style={{ padding: 16, background: "var(--surface-container-low)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-sm">Số lượng tiêu huỷ</label>
                    <input 
                      type="number" 
                      max={selectedBatch.quantity} 
                      min={1} 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))} 
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label className="text-label-sm">Vị trí lô</label>
                    <div style={{ padding: "8px 12px", background: "var(--surface-container)", borderRadius: 8, fontWeight: 700 }}>
                      {selectedBatch.position}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="text-label-sm">Lý do tiêu huỷ</label>
                  <textarea 
                    rows={2} 
                    placeholder="Ví dụ: Lô thuốc hết hạn sử dụng, bao bì hỏng..." 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>Hủy</button>
              <button 
                className="btn btn-primary" 
                style={{ background: "var(--error)", border: "none" }} 
                disabled={submitting || !selectedBatch}
                onClick={handleDispose}
              >
                {submitting ? "Đang xử lý..." : "Xác nhận tiêu huỷ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
