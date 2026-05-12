import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Icon } from "../../components/UI";
import {
  changePassword,
  getProfile,
  updateProfile,
  type UserProfileResponse,
} from "../../api/userApi";
import { usePreferences } from "../../app/preferences";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserProfileResponse["role"];
};

const emptyForm: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  role: "REQUESTER",
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }

  return fallback;
};

export default function ProfilePage() {
  const { t } = usePreferences();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfile();

        if (!active) return;

        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          role: res.data.role,
        });
      } catch (err) {
        if (active) {
          setProfileError(getErrorMessage(err, "Không thể tải thông tin cá nhân."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setProfileMessage("");
    setProfileError("");

    if (!form.name.trim() || !form.email.trim()) {
      setProfileError("Vui lòng nhập họ tên và email.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });

      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        role: res.data.role,
      });

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsedUser,
            name: res.data.name,
            email: res.data.email,
          }),
        );
      }

      setProfileMessage("Cập nhật thông tin thành công.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Cập nhật thông tin thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!passwordForm.current || !passwordForm.newPassword || !passwordForm.confirm) {
      setPasswordError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordForm.current, passwordForm.newPassword);
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
      setPasswordMessage("Đổi mật khẩu thành công.");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Đổi mật khẩu thất bại."));
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = useMemo(() => {
    return (
      form.name
        ?.split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase() || "U"
    );
  }, [form.name]);

  const roleLabel = useMemo<Record<UserProfileResponse["role"], string>>(
    () => ({
      REQUESTER: t("role.requester"),
      STOREKEEPER: t("role.storekeeper"),
      MANAGER: t("role.manager"),
    }),
    [t],
  );

  if (loading) {
    return (
      <div className="page profile-page animate-fade-in">
        <PageHeader title="Thông tin cá nhân" subtitle="Xem và cập nhật thông tin tài khoản" />
        <div className="metric-card profile-card">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="page profile-page animate-fade-in">
      <PageHeader title="Thông tin cá nhân" subtitle="Xem và cập nhật thông tin tài khoản" />

      <div className="profile-grid">
        <div className="metric-card profile-card">
          <div className="profile-card-header">
            <div
              className="profile-avatar"
            >
              <span className="font-headline">
                {initials}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--on-surface)" }}>{form.name}</div>
              <span className={`role-badge role-${form.role}`}>{roleLabel[form.role]}</span>
            </div>
          </div>

          <div className="wms-form" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Họ tên</label>
              <input
                id="profile-name"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  setProfileError("");
                  setProfileMessage("");
                }}
                placeholder="Họ và tên"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Email</label>
              <input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setProfileError("");
                  setProfileMessage("");
                }}
                placeholder="email@example.com"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Số điện thoại</label>
              <input
                id="profile-phone"
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value });
                  setProfileError("");
                  setProfileMessage("");
                }}
                placeholder="0900000000"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Vai trò</label>
              <input
                id="profile-role"
                disabled
                value={roleLabel[form.role]}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Địa chỉ</label>
              <input
                id="profile-address"
                value={form.address}
                onChange={(e) => {
                  setForm({ ...form, address: e.target.value });
                  setProfileError("");
                  setProfileMessage("");
                }}
                placeholder="Địa chỉ"
              />
            </div>

            {profileError && <p style={{ color: "var(--error)", fontSize: "0.82rem", margin: 0 }}>{profileError}</p>}
            {profileMessage && <p style={{ color: "var(--secondary)", fontSize: "0.82rem", margin: 0 }}>{profileMessage}</p>}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <button id="btn-save-profile" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Icon name="save" size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>

        <div className="metric-card profile-card">
          <div className="profile-card-header profile-card-header--compact">
            <div
              className="profile-danger-icon"
            >
              <Icon name="lock" size={20} style={{ color: "var(--error)" }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--on-surface)" }}>Đổi mật khẩu</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--on-surface-variant)" }}>Cập nhật mật khẩu bảo mật tài khoản</p>
            </div>
          </div>

          <div className="wms-form" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Mật khẩu hiện tại</label>
              <input
                id="password-current"
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordForm.current}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, current: e.target.value });
                  setPasswordError("");
                  setPasswordMessage("");
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Mật khẩu mới</label>
              <input
                id="password-new"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  setPasswordError("");
                  setPasswordMessage("");
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="text-label-sm" style={{ color: "var(--on-surface-variant)" }}>Xác nhận mật khẩu mới</label>
              <input
                id="password-confirm"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirm}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirm: e.target.value });
                  setPasswordError("");
                  setPasswordMessage("");
                }}
              />
            </div>

            {passwordError && <p style={{ color: "var(--error)", fontSize: "0.82rem", margin: 0 }}>{passwordError}</p>}
            {passwordMessage && <p style={{ color: "var(--secondary)", fontSize: "0.82rem", margin: 0 }}>{passwordMessage}</p>}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <button id="btn-change-password" className="btn btn-danger" onClick={handleChangePassword} disabled={changingPassword}>
                <Icon name="lock_reset" size={16} /> {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
