import { useMemo, useState, useEffect } from "react";
import { PageHeader, StatusPill, Icon, EmptyState } from "../../../components/UI";
import { getInventoryLogs, getImportRequests, cancelImportRequest } from "../../../api/medicineRequestApi";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { ROLES } from "../../../constants/role";
import { toast } from "react-toastify";

/* ─── Giữ nguyên types ─── */
type HistoryItem = {
  id: number;
  requestCode: string;
  type: "IMPORT" | "EXPORT" | "ADJUST" | "DISPOSE";
  date: string;
  status: "approved" | "pending" | "rejected" | "cancelled" | "shortage" | "excess";
  items: { product: string; quantity: number }[];
  note?: string;
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Hoàn tất",
  pending: "Đang chờ",
  rejected: "Từ chối",
  cancelled: "Đã huỷ",
  shortage: "Thiếu thuốc",
  excess: "Dư số lượng",
};

export default function StockHistoryPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isManager = user?.role === ROLES.MANAGER;

  const [tab, setTab] = useState<"IMPORT" | "EXPORT" | "DISPOSE">("IMPORT");
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === "DISPOSE") {
        const res = await axios.get("http://localhost:3000/api/disposals/history", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const mapped: HistoryItem[] = res.data.map((d: any) => ({
          id: d.id,
          requestCode: `DIS-${String(d.id).padStart(3, "0")}`,
          type: "DISPOSE",
          date: d.created_at ? new Date(d.created_at).toLocaleDateString("vi-VN") : "—",
          status: "approved",
          items: [{ product: d.medicine_name, quantity: d.quantity }],
          note: d.reason
        }));
        setHistory(mapped);
      } else {
        const [logsRes, requestsRes] = await Promise.all([
          getInventoryLogs(tab),
          (tab === "IMPORT" && isManager) ? getImportRequests() : Promise.resolve({ data: [] })
        ]);

        const logs: HistoryItem[] = logsRes.data.map((log: any) => ({
          id: log.id,
          requestCode: `LOG-${String(log.id).padStart(3, "0")}`,
          type: log.type as "IMPORT" | "EXPORT" | "ADJUST" | "DISPOSE",
          date: log.created_at ? new Date(log.created_at).toLocaleDateString("vi-VN") : "—",
          status: log.note?.toLowerCase().includes("từ chối") ? "rejected"
                : log.note?.toLowerCase().includes("thiếu") ? "shortage"
                : log.note?.toLowerCase().includes("dư") ? "excess"
                : "approved",
          items: [{ product: log.medicine_name || `Thuốc #${log.medicine_id}`, quantity: Math.abs(Number(log.change_amount)) }],
          note: log.note
        }));

        // Chỉ lấy các request PENDING hoặc CANCELLED để hiển thị thêm
        const pendingRequests: HistoryItem[] = (requestsRes.data || [])
          .filter((r: any) => r.status === "PENDING" || r.status === "CANCELLED")
          .map((r: any) => ({
            id: r.id,
            requestCode: `REQ-${String(r.id).padStart(3, "0")}`,
            type: "IMPORT",
            date: r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : "—",
            status: r.status === "PENDING" ? "pending" : "cancelled",
            items: [{ product: r.medicine_name, quantity: r.quantity }],
            note: r.note,
            isRequest: true, // Flag để phân biệt
          }));

        setHistory([...pendingRequests, ...logs]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tải lịch sử kho");
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs theo tab
  useEffect(() => {
    fetchData();
  }, [tab, isManager]);

  const handleCancelRequest = async (id: number) => {
    setCancelling(true);
    try {
      await cancelImportRequest(id);
      toast.success("Đã huỷ yêu cầu");
      setConfirmCancelId(null);
      // Cập nhật UI ngay lập tức
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi huỷ yêu cầu");
    } finally {
      setCancelling(false);
    }
  };

  const data = useMemo(() => history, [history]);

  return (
    <div className="page animate-fade-in">
      <PageHeader
        title="Lịch sử kho"
        subtitle="Theo dõi lịch sử xuất / nhập kho"
      />

      {/* ─── Tabs ─── */}
      <div className="tab-group" style={{ alignSelf: "flex-start", display: "inline-flex", marginBottom: 20 }}>
        <button id="tab-import" className={`tab${tab === "IMPORT" ? " active" : ""}`} onClick={() => setTab("IMPORT")}>
          <Icon name="input" size={16} /> Nhập kho
        </button>
        <button id="tab-export" className={`tab${tab === "EXPORT" ? " active" : ""}`} onClick={() => setTab("EXPORT")}>
          <Icon name="output" size={16} /> Xuất kho
        </button>
        <button id="tab-dispose" className={`tab${tab === "DISPOSE" ? " active" : ""}`} onClick={() => setTab("DISPOSE")}>
          <Icon name="auto_delete" size={16} /> Tiêu huỷ
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="metric-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
            Đang tải lịch sử...
          </div>
        ) : (
          <table className="wms-table">
            <thead>
              <tr>
                <th>Mã log</th>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon="history" message="Không có lịch sử" />
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.requestCode}</td>
                    <td>{item.date}</td>
                    <td>
                      <StatusPill status={item.type} label={item.type === "IMPORT" ? "Nhập kho" : item.type === "EXPORT" ? "Xuất kho" : "Tiêu huỷ"} />
                    </td>
                    <td>
                      <StatusPill status={item.status} label={STATUS_LABEL[item.status]} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          id={`detail-${item.id}`}
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          onClick={() => setSelected(item)}
                        >
                          <Icon name="visibility" size={14} /> Xem
                        </button>
                        {(item as any).isRequest && item.status === "pending" && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: "6px 12px", fontSize: "0.8rem", background: "var(--error)", border: "none" }}
                            onClick={() => setConfirmCancelId(item.id)}
                          >
                            <Icon name="cancel" size={14} /> Huỷ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Detail modal ─── */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal-box-sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 className="font-headline" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  Chi tiết {selected.requestCode}
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", marginTop: 2 }}>
                  {selected.type === "IMPORT" ? "Nhập kho" : selected.type === "EXPORT" ? "Xuất kho" : "Tiêu huỷ"} · {selected.date}
                </p>
              </div>
              <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setSelected(null)}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <div
              style={{
                border: "1px solid var(--outline-variant)",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div style={{ background: "var(--surface-container-low)", padding: "10px 16px", display: "grid", gridTemplateColumns: "1fr auto" }}>
                <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Sản phẩm</span>
                <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Số lượng</span>
              </div>
              {selected.items.map((i, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    padding: "12px 16px",
                    borderTop: "1px solid var(--outline-variant)",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>{i.product}</span>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>×{i.quantity}</span>
                </div>
              ))}
            </div>

            {selected.note && (
              <div style={{ marginBottom: 16 }}>
                <span className="text-label-sm" style={{ color: "var(--on-surface-variant)", display: "block", marginBottom: 4 }}>
                  Ghi chú / Lý do
                </span>
                <div style={{ padding: "10px 12px", background: "var(--surface-container-low)", borderRadius: 8, fontSize: "0.875rem" }}>
                  {selected.note}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StatusPill status={selected.status} label={STATUS_LABEL[selected.status]} />
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Cancel Modal ─── */}
      {confirmCancelId && (
        <div className="modal-overlay">
          <div className="modal-box-sm wms-form">
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <Icon name="warning" size={48} style={{ color: "var(--error)", marginBottom: 16 }} />
              <h2 className="font-headline" style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 8 }}>
                Xác nhận huỷ yêu cầu
              </h2>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", marginBottom: 24 }}>
                Bạn có chắc chắn muốn huỷ yêu cầu nhập kho này không? Hành động này không thể hoàn tác.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setConfirmCancelId(null)}
                  disabled={cancelling}
                >
                  Bỏ qua
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ background: "var(--error)", border: "none" }}
                  onClick={() => handleCancelRequest(confirmCancelId)}
                  disabled={cancelling}
                >
                  {cancelling ? "Đang huỷ..." : "Đồng ý huỷ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
