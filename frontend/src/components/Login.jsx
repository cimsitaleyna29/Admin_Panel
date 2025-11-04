import { useState } from "react";

const initialFormState = {
  email: "",
  password: ""
};

const Login = ({
  onLogin,
  loading,
  errorMessage,
  successMessage,
  onClearError
}) => {
  const [form, setForm] = useState(initialFormState);
  const [remember, setRemember] = useState(false);
  const hasError = Boolean(errorMessage);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (onClearError) {
      onClearError();
    }
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRememberChange = (event) => {
    setRemember(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin(form);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-simple">
        <div className="auth-card-content">
          <h1 className="auth-title text-center mb-4">Giriş Yap</h1>
          {successMessage && (
            <div className="alert alert-success mb-3" role="alert">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="mb-4">
              <label htmlFor="login-email" className="form-label">
                E-Posta Adresi
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                className={`form-control auth-input ${hasError ? "is-invalid" : ""}`}
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="örnek@domain.com"
              />
            </div>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <label htmlFor="login-password" className="form-label mb-0">
                  Şifre
                </label>
                <button type="button" className="auth-forgot-link">
                  Şifrenizi mi unuttunuz?
                </button>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                className={`form-control auth-input ${hasError ? "is-invalid" : ""}`}
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="********"
              />
            </div>
            <div className="auth-sub-actions mb-3">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={handleRememberChange}
                  disabled={loading}
                />
                <span>Beni Hatırla</span>
              </label>
            </div>
            {errorMessage && (
              <div className="alert alert-danger mb-3" role="alert">
                {errorMessage}
              </div>
            )}
            <button type="submit" className="auth-button w-100" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
