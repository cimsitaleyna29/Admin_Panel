const Navbar = ({ currentUser, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">Kullanıcı Yönetimi</span>
        <div className="d-flex align-items-center gap-3 text-white">
          {currentUser && (
            <span className="small">
              {currentUser.name} ({currentUser.email})
            </span>
          )}
          <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
            Çıkış Yap
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
