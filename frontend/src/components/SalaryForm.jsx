import { useState } from "react";

const readOnlyInput = (label, value) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <input className="form-control" value={value ?? ""} readOnly />
  </div>
);

const SalaryForm = ({
  user,
  title = "Kullanıcı Maaş Bilgisi",
  submitLabel = "Maaş Kaydet",
  loading,
  onCancel,
  onSubmit
}) => {
  const [salary, setSalary] = useState(user.salary ?? "");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(salary);
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form-card">
        <h3 className="user-form-title">{title}</h3>
        <div className="row">
          <div className="col-md-6">{readOnlyInput("Ad", user.name)}</div>
          <div className="col-md-6">
            {readOnlyInput("Soyad", user.surname)}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">{readOnlyInput("E-posta", user.email)}</div>
          <div className="col-md-6">
            {readOnlyInput("Telefon", user.phone || "-")}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Maaş (TL)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <div className="user-form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={loading}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SalaryForm;
