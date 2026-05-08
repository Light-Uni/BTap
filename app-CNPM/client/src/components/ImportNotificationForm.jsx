import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Icon } from "./UI";

const API_BASE = "http://localhost:3000/api";

const INITIAL_FORM = {
  medicineId: "",
  quantity: "",
  supplierId: "",
  expectedDeliveryDate: "",
};

const INITIAL_ERRORS = {
  medicineId: "",
  quantity: "",
  supplierId: "",
  expectedDeliveryDate: "",
};

function getHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Không thể gửi thông báo nhập"
  );
}

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function RequiredMark() {
  return <span style={{ color: "var(--error)", marginLeft: 3 }}>*</span>;
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <div style={{ color: "var(--error)", fontSize: "0.78rem", fontWeight: 600 }}>
      {message}
    </div>
  );
}

export default function ImportNotificationForm({
  medicines: initialMedicines,
  suppliers: initialSuppliers,
  onCreated,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [medicines, setMedicines] = useState(initialMedicines || []);
  const [suppliers, setSuppliers] = useState(initialSuppliers || []);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refs = {
    medicineId: useRef(null),
    quantity: useRef(null),
    supplierId: useRef(null),
    expectedDeliveryDate: useRef(null),
  };

  useEffect(() => {
    if (initialMedicines) setMedicines(initialMedicines);
  }, [initialMedicines]);

  useEffect(() => {
    if (initialSuppliers) setSuppliers(initialSuppliers);
  }, [initialSuppliers]);

  useEffect(() => {
    if (initialMedicines && initialSuppliers) return;

    let mounted = true;

    async function fetchOptions() {
      setLoadingOptions(true);
      try {
        const requests = [];

        if (!initialMedicines) {
          requests.push(
            axios
              .get(`${API_BASE}/medicines`, { headers: getHeaders() })
              .then((res) => {
                if (mounted) setMedicines(res.data);
              }),
          );
        }

        if (!initialSuppliers) {
          requests.push(
            axios
              .get(`${API_BASE}/suppliers`, { headers: getHeaders() })
              .then((res) => {
                if (mounted) setSuppliers(res.data);
              })
              .catch(() => {
                if (mounted) setSuppliers([]);
              }),
          );
        }

        await Promise.all(requests);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      } finally {
        if (mounted) setLoadingOptions(false);
      }
    }

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, [initialMedicines, initialSuppliers]);

  function validate() {
    const nextErrors = { ...INITIAL_ERRORS };

    if (isEmpty(form.medicineId)) {
      nextErrors.medicineId = "Vui lòng chọn thuốc";
    }

    if (isEmpty(form.quantity)) {
      nextErrors.quantity = "Vui lòng nhập số lượng";
    } else if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) <= 0) {
      nextErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (isEmpty(form.supplierId)) {
      nextErrors.supplierId = "Vui lòng chọn nhà cung cấp";
    }

    if (isEmpty(form.expectedDeliveryDate)) {
      nextErrors.expectedDeliveryDate = "Vui lòng chọn ngày giao dự kiến";
    }

    setErrors(nextErrors);

    const firstInvalidField = Object.keys(nextErrors).find((field) => nextErrors[field]);
    if (firstInvalidField) {
      refs[firstInvalidField].current?.focus();
      return false;
    }

    return true;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await axios.post(
        `${API_BASE}/import-notifications`,
        {
          medicineId: Number(form.medicineId),
          quantity: Number(form.quantity),
          supplierId: Number(form.supplierId),
          expectedDeliveryDate: form.expectedDeliveryDate,
        },
        { headers: getHeaders() },
      );

      toast.success("Đã gửi thông báo nhập");
      setForm(INITIAL_FORM);
      setErrors(INITIAL_ERRORS);
      onCreated?.(res.data);
    } catch (error) {
      if (error?.response?.status === 400) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(getApiErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="metric-card wms-form" onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
            Thuốc
            <RequiredMark />
          </span>
          <select
            ref={refs.medicineId}
            value={form.medicineId}
            onChange={(event) => updateField("medicineId", event.target.value)}
            disabled={loadingOptions || submitting}
          >
            <option value="">-- Chọn thuốc --</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.medicineId} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
            Số lượng
            <RequiredMark />
          </span>
          <input
            ref={refs.quantity}
            type="number"
            min="1"
            step="1"
            value={form.quantity}
            onChange={(event) => updateField("quantity", event.target.value)}
            disabled={submitting}
          />
          <FieldError message={errors.quantity} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
            Nhà cung cấp
            <RequiredMark />
          </span>
          <select
            ref={refs.supplierId}
            value={form.supplierId}
            onChange={(event) => updateField("supplierId", event.target.value)}
            disabled={loadingOptions || submitting}
          >
            <option value="">-- Chọn nhà cung cấp --</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.supplierId} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>
            Ngày giao dự kiến
            <RequiredMark />
          </span>
          <input
            ref={refs.expectedDeliveryDate}
            type="date"
            value={form.expectedDeliveryDate}
            onChange={(event) => updateField("expectedDeliveryDate", event.target.value)}
            disabled={submitting}
          />
          <FieldError message={errors.expectedDeliveryDate} />
        </label>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || loadingOptions}
          style={{ justifyContent: "center", padding: "12px 18px", marginTop: 4 }}
        >
          <Icon name="notification_add" size={18} />
          {submitting ? "Đang gửi..." : "Gửi thông báo nhập"}
        </button>
      </div>
    </form>
  );
}
