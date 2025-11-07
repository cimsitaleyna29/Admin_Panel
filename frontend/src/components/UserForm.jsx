import { useEffect, useState } from "react";

const DEFAULT_ROLE_OPTIONS = ["admin", "user"];

const UserForm = ({
  initialData,
  isEditing,
  onSubmit,
  onCancel,
  loading,
  title,
  submitLabel,
  showRoleField = false,
  roleOptions = DEFAULT_ROLE_OPTIONS
}) => {
  const [form, setForm] = useState(initialData);

  useEffect(() => {
    setForm({
      ...initialData,
      ...(showRoleField && !initialData.role ? { role: roleOptions[0] } : {})
    });
  }, [initialData, showRoleField, roleOptions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      if (showRoleField && name !== "role") {
        return prev;
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const payload =
      showRoleField && form.role ? { role: form.role } : { ...form };
    await onSubmit(payload);
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h3 className="h5 mb-3">
          {title || (isEditing ? "Kullanıcıyı Güncelle" : "Yeni Kullanıcı")}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">
                Ad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                value={form.name || ""}
                onChange={handleChange}
                required
                disabled={loading || showRoleField}
                readOnly={showRoleField}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="surname" className="form-label">
                Soyad
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                className="form-control"
                value={form.surname || ""}
                onChange={handleChange}
                required
                disabled={loading || showRoleField}
                readOnly={showRoleField}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                value={form.email || ""}
                onChange={handleChange}
                required
                disabled={loading || showRoleField}
                readOnly={showRoleField}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">
                Telefon
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                className="form-control"
                value={form.phone || ""}
                onChange={handleChange}
                disabled={loading || showRoleField}
                readOnly={showRoleField}
                placeholder="(Opsiyonel)"
              />
            </div>
            {!isEditing && !showRoleField && (
              <div className="col-md-6">
                <label htmlFor="password" className="form-label">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  value={form.password || ""}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            )}
            {showRoleField && (
              <div className="col-md-6">
                <label htmlFor="role" className="form-label">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={form.role || roleOptions[0]}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  {roleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-success"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Kaydediliyor..." : submitLabel || "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
