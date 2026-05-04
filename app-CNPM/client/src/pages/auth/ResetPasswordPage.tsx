import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import { Icon } from "../../components/UI";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, password);
      setDone(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể đặt lại mật khẩu. Vui lòng yêu cầu gửi lại email mới.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flip-wrapper animate-fade-in">
      <div className="auth-simple-card">
        <Link className="auth-flip-link auth-simple-back-link" to="/login">
          <Icon name="arrow_back" size={16} /> Quay lại đăng nhập
        </Link>

        {!done ? (
          <>
            <div className="auth-flip-title">Đặt lại mật khẩu</div>
            <p className="auth-simple-copy">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            <form className="auth-flip-form" onSubmit={handleSubmit}>
              <input
                id="reset-password"
                className="auth-flip-input"
                name="password"
                type="password"
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
              />
              <input
                id="reset-confirm-password"
                className="auth-flip-input"
                name="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
              />

              {error && (
                <div className="auth-flip-message">
                  <Icon name="error" size={15} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="reset-submit"
                className="auth-flip-btn"
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-simple-success">
            <Icon name="check_circle" size={42} style={{ color: "var(--auth-main-color)" }} />
            <div className="auth-flip-title">Đã cập nhật</div>
            <p className="auth-simple-copy">
              Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <Link className="auth-flip-btn" to="/login" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
