import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import { Icon } from "../../components/UI";
import { usePreferences } from "../../app/preferences";

export default function ResetPasswordPage() {
  const { t } = usePreferences();
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
      setError(t("auth.resetInvalidLink"));
      return;
    }

    if (!password || !confirmPassword) {
      setError(t("auth.resetRequired"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.resetMismatch"));
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
      setError(err?.response?.data?.message || t("auth.resetError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flip-wrapper animate-fade-in">
      <div className="auth-simple-card">
        <Link className="auth-flip-link auth-simple-back-link" to="/login">
          <Icon name="arrow_back" size={16} /> {t("auth.backToLogin")}
        </Link>

        {!done ? (
          <>
            <div className="auth-flip-title">{t("auth.resetTitle")}</div>
            <p className="auth-simple-copy">
              {t("auth.resetCopy")}
            </p>

            <form className="auth-flip-form" onSubmit={handleSubmit}>
              <input
                id="reset-password"
                className="auth-flip-input"
                name="password"
                type="password"
                placeholder={t("auth.newPassword")}
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
                placeholder={t("auth.confirmPassword")}
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
                {loading ? t("auth.resetLoading") : t("auth.resetSubmit")}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-simple-success">
            <Icon name="check_circle" size={42} style={{ color: "var(--auth-main-color)" }} />
            <div className="auth-flip-title">{t("auth.resetDoneTitle")}</div>
            <p className="auth-simple-copy">
              {t("auth.resetDoneCopy")}
            </p>
            <Link className="auth-flip-btn" to="/login" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              {t("auth.login")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
