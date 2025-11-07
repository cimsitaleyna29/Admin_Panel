const UserList = ({
  users,
  loading,
  onEdit,
  onDelete,
  onRole,
  showRoleAction = true
}) => {
  if (loading && users.length === 0) {
    return (
      <div className="user-table-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <p className="user-table-empty">
        Henüz kayıtlı kullanıcı bulunmuyor.
      </p>
    );
  }

  return (
    <table className="user-table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Ad</th>
          <th scope="col">Soyad</th>
          <th scope="col">E-posta</th>
          <th scope="col">Telefon</th>
          <th scope="col">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.surname}</td>
            <td>{user.email}</td>
            <td>{user.phone || "-"}</td>
            <td>
              <div className="user-actions">
                <button
                  className="user-action user-action-edit"
                  onClick={() => onEdit(user)}
                >
                  Düzenle
                </button>
                {showRoleAction && onRole && (
                  <button
                    className="user-action user-action-role"
                    onClick={() => onRole(user)}
                  >
                    Rol Ekle
                  </button>
                )}
                <button
                  className="user-action user-action-delete"
                  onClick={() => onDelete(user.id)}
                >
                  Sil
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserList;
