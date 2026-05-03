import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { EmptyState, PageHeader, StatusPill } from "./UI";

const API_URL = "http://localhost:3000/api/warehouse/removal-requests";

function getHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Không thể tải danh sách yêu cầu";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

export default function RemovalRequestList({ initialStatus = "" }) {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchRequests() {
      setLoading(true);
      try {
        const res = await axios.get(API_URL, {
          headers: getHeaders(),
          params: status ? { status } : undefined,
        });
        if (mounted) setRequests(res.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchRequests();

    return () => {
      mounted = false;
    };
  }, [status]);

  return (
    <div className="page animate-fade-in">
      <PageHeader
        title="Yêu cầu bỏ thuốc"
        subtitle="Theo dõi các yêu cầu xoá thuốc khỏi tủ kho"
        actions={
          <select
            className="wms-input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{ width: 180 }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />

      <div className="metric-card" style={{ overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 36, textAlign: "center", color: "var(--on-surface-variant)" }}>
            Đang tải danh sách yêu cầu...
          </div>
        ) : requests.length === 0 ? (
          <EmptyState icon="delete_sweep" message="Chưa có yêu cầu bỏ thuốc nào" />
        ) : (
          <table className="wms-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Cabinet</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.medicine}</td>
                  <td>{request.cabinet}</td>
                  <td>{request.quantity}</td>
                  <td>{request.reason}</td>
                  <td>{request.requestedBy || "-"}</td>
                  <td>
                    <StatusPill status={request.status} />
                  </td>
                  <td>{formatDate(request.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
