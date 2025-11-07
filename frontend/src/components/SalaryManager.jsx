import { useEffect, useMemo, useState } from "react";

const buildInitialDrafts = (users) => {
  const map = {};
  users.forEach((user) => {
    map[user.id] = user.details?.salary ?? "";
  });
  return map;
};

const SalaryManager = ({
  users,
  loading,
  onClose,
  onSave,
  title = "Maaş Bilgileri",
  showCloseButton = true
}) => {
  const [drafts, setDrafts] = useState(() => buildInitialDrafts(users));

  useEffect(() => {
    setDrafts(buildInitialDrafts(users));
  }, [users]);

  const visibleUsers = useMemo(() => users ?? [], [users]);

  const handleChange = (userId, value) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: value
    }));
  };

  return (
    <div className="salary-manager card">
      <div className="salary-manager-header">
        <h3 className="salary-manager-title">{title}</h3>
        {showCloseButton && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Kapat
          </button>
        )}
      </div>
      <div className="table-responsive">
        <table className="table table-hover salary-manager-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Ad</th>
              <th scope="col">Soyad</th>
              <th scope="col">E-posta</th>
              <th scope="col">Telefon</th>
              <th scope="col">Maaş (TL)</th>
              <th scope="col">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.surname}</td>
                <td>{user.email}</td>
                <td>{user.phone || "-"}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control salary-input"
                    value={drafts[user.id] ?? ""}
                    onChange={(event) =>
                      handleChange(user.id, event.target.value)
                    }
                    disabled={loading}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={loading}
                    onClick={() => onSave(user.id, drafts[user.id])}
                  >
                    Kaydet
                  </button>
                </td>
              </tr>
            ))}
            {visibleUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  Gösterilecek kullanıcı bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryManager;
