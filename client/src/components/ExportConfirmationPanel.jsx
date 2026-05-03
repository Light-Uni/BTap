import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { EmptyState, Icon, PageHeader, StatusPill } from "./UI";

const API_BASE = "http://localhost:3000/api";
const PENDING_STATUSES = new Set(["PENDING", "APPROVED", "pending", "approved"]);

function getHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function getRequestedQuantity(request) {
  return (request.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function getMedicineNames(request) {
  return (request.items || [])
    .map((item) => item.medicine_name)
    .filter(Boolean)
    .join(", ");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function ExportConfirmationPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [partialRequestId, setPartialRequestId] = useState(null);
  const [partialQuantities, setPartialQuantities] = useState({});
  const [rejectRequest, setRejectRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingRequests = useMemo(
    () => requests.filter((request) => PENDING_STATUSES.has(request.status)),
    [requests],
  );

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/export-requests`, {
        headers: getHeaders(),
      });
      setRequests(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải yêu cầu xuất kho"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function confirmRequest(id, payload) {
    setSubmittingId(id);
    try {
      await axios.put(`${API_BASE}/export-requests/${id}/confirm`, payload, {
        headers: getHeaders(),
      });
      toast.success("Đã cập nhật xác nhận xuất kho");
      setPartialRequestId(null);
      setRejectRequest(null);
      setRejectionReason("");
      await fetchRequests();
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xác nhận yêu cầu xuất kho"));
    } finally {
      setSubmittingId(null);
    }
  }

  function getPartialQuantity(id) {
    return partialQuantities[id] || "";
  }

  function isPartialValid(id) {
    return Number(getPartialQuantity(id)) > 0;
  }

  const isRejectValid = rejectionReason.trim().length > 0;

  return (
    <div className="page animate-fade-in">
      <PageHeader
        title="Xác nhận xuất kho"
        subtitle="Dược sĩ xác nhận đủ, thiếu hoặc từ chối yêu cầu xuất thuốc"
      />

      <div className="metric-card" style={{ overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 36, textAlign: "center", color: "var(--on-surface-variant)" }}>
            Đang tải danh sách yêu cầu...
          </div>
        ) : pendingRequests.length === 0 ? (
          <EmptyState icon="inventory_2" message="Không có yêu cầu xuất kho đang chờ xác nhận" />
        ) : (
          <table className="wms-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Requested Quantity</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => {
                const isSubmitting = submittingId === request.id;
                const isPartialOpen = partialRequestId === request.id;

                return (
                  <tr key={request.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{getMedicineNames(request) || "-"}</div>
                      <StatusPill status={String(request.status).toLowerCase()} />
                    </td>
                    <td>{getRequestedQuantity(request)}</td>
                    <td>{request.requester_name || "-"}</td>
                    <td>{formatDate(request.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <button
                          className="btn btn-primary"
                          disabled={isSubmitting}
                          onClick={() => confirmRequest(request.id, { status: "confirmed_full" })}
                          style={{ padding: "7px 12px" }}
                        >
                          {isSubmitting ? "..." : "Đủ"}
                        </button>

                        <button
                          className="btn btn-secondary"
                          disabled={isSubmitting}
                          onClick={() =>
                            setPartialRequestId(isPartialOpen ? null : request.id)
                          }
                          style={{ padding: "7px 12px" }}
                        >
                          Thiếu
                        </button>

                        <button
                          className="btn btn-danger"
                          disabled={isSubmitting}
                          onClick={() => {
                            setRejectRequest(request);
                            setRejectionReason("");
                          }}
                          style={{ padding: "7px 12px" }}
                        >
                          Từ chối
                        </button>

                        {isPartialOpen && (
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                              className="wms-input"
                              type="number"
                              min="1"
                              value={getPartialQuantity(request.id)}
                              onChange={(event) =>
                                setPartialQuantities((prev) => ({
                                  ...prev,
                                  [request.id]: event.target.value,
                                }))
                              }
                              placeholder="SL thực tế"
                              style={{ width: 120, padding: "7px 10px" }}
                              disabled={isSubmitting}
                            />
                            <button
                              className="btn btn-primary"
                              disabled={isSubmitting || !isPartialValid(request.id)}
                              onClick={() =>
                                confirmRequest(request.id, {
                                  status: "confirmed_partial",
                                  actualQuantity: Number(getPartialQuantity(request.id)),
                                })
                              }
                              style={{ padding: "7px 12px" }}
                            >
                              Gửi
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {rejectRequest && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget && !submittingId) {
              setRejectRequest(null);
            }
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
            style={{ width: "min(440px, 100%)", display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
                  Từ chối yêu cầu
                </div>
                <h2 className="font-headline" style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                  Request #{rejectRequest.id}
                </h2>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={Boolean(submittingId)}
                onClick={() => setRejectRequest(null)}
                style={{ width: 36, height: 36, padding: 0, justifyContent: "center" }}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <textarea
              className="wms-input"
              rows={5}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Nhập lý do từ chối"
              disabled={Boolean(submittingId)}
            />

            <button
              className="btn btn-danger"
              disabled={Boolean(submittingId) || !isRejectValid}
              onClick={() =>
                confirmRequest(rejectRequest.id, {
                  status: "rejected",
                  rejectionReason: rejectionReason.trim(),
                })
              }
              style={{ justifyContent: "center", padding: "12px 18px" }}
            >
              {submittingId === rejectRequest.id ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
