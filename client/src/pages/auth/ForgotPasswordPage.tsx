import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authApi";
import { Icon } from "../../components/UI";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setLoading(true);
    setError("");

    try {
      await forgotPassword(trimmedEmail);
      setEmail(trimmedEmail);
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể gửi email đặt lại mật khẩu.");
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

        {!sent ? (
          <>
            <div className="auth-flip-title">Quên mật khẩu</div>
            <p className="auth-simple-copy">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
            </p>

            <form className="auth-flip-form" onSubmit={handleSubmit}>
              <input
                id="forgot-email"
                className="auth-flip-input"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                autoComplete="email"
              />

              {error && (
                <div className="auth-flip-message">
                  <Icon name="error" size={15} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="forgot-submit"
                className="auth-flip-btn"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi liên kết"}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-simple-success">
            <Icon name="mark_email_read" size={42} style={{ color: "var(--auth-main-color)" }} />
            <div className="auth-flip-title">Đã gửi email</div>
            <p className="auth-simple-copy">
              Kiểm tra hộp thư <strong>{email}</strong> để đặt lại mật khẩu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
