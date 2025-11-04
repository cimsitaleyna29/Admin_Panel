import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import UserForm from "./components/UserForm";
import UserList from "./components/UserList";
import {
  clearSession,
  createUser,
  deleteUser,
  getUsers,
  loginUser,
  updateUser
} from "./services/userService";

const TURKISH_CHAR_MAP = {
  ı: "i",
  İ: "I",
  ş: "s",
  Ş: "S",
  ğ: "g",
  Ğ: "G",
  ü: "u",
  Ü: "U",
  ö: "o",
  Ö: "O",
  ç: "c",
  Ç: "C"
};

const normalizeEmailForAuth = (value) =>
  value.replace(/[ıİşŞğĞüÜöÖçÇ]/g, (char) => TURKISH_CHAR_MAP[char] ?? char);

const emptyForm = {
  name: "",
  surname: "",
  email: "",
  phone: "",
  role: "user"
};

const FORM_MODES = {
  CREATE: "create",
  EDIT: "edit",
  ROLE: "role"
};

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState(() => ({ ...emptyForm }));
  const [editingId, setEditingId] = useState(null);
  const [formMode, setFormMode] = useState(FORM_MODES.CREATE);
  const formRef = useRef(null);

  const isAuthenticated = useMemo(() => Boolean(currentUser), [currentUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const list = await getUsers();
        setUsers(list);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Kullanici listesi getirilirken hata olustu."
        );
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [isAuthenticated]);

  const handleLogin = async ({ email, password }) => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("E-posta ve sifre zorunludur.");
      return false;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const normalizedEmail = normalizeEmailForAuth(trimmedEmail);
      const authenticated = await loginUser({
        email: normalizedEmail,
        password: trimmedPassword
      });
      const list = await getUsers();
      setUsers(list);
      const matchedUser = list.find(
        (user) => user.email.toLowerCase() === normalizedEmail.toLowerCase()
      );
      setCurrentUser({
        ...authenticated,
        name: matchedUser?.name || "Yonetici",
        surname: matchedUser?.surname,
        role: matchedUser?.role,
        email: trimmedEmail
      });
      setSuccess("");
      navigate("/users", { replace: true });
      return true;
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError("Girilen bilgi hatali. Lutfen e-posta ve sifre bilgilerini kontrol edin.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Giris sirasinda bir hata olustu. Lutfen tekrar deneyin."
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const openForm = ({ data, mode, id }) => {
    setFormData(data);
    setEditingId(id ?? null);
    setFormMode(mode);
    setFormVisible(true);
    setSuccess("");
    setError("");
    scrollToForm();
  };

  const handleCreateUserForm = () => {
    openForm({
      data: { ...emptyForm },
      mode: FORM_MODES.CREATE
    });
  };

  const handleEditUserForm = (user) => {
    openForm({
      data: {
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "user"
      },
      mode: FORM_MODES.EDIT,
      id: user.id
    });
  };

  const handleRoleForm = (user) => {
    openForm({
      data: {
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "user"
      },
      mode: FORM_MODES.ROLE,
      id: user.id
    });
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (formMode === FORM_MODES.CREATE) {
        await createUser(values);
        setSuccess("Yeni kullanici olusturuldu.");
      } else if (editingId) {
        await updateUser(editingId, values);
        setSuccess(
          formMode === FORM_MODES.ROLE
            ? "Kullanici rolu guncellendi."
            : "Kullanici guncellendi."
        );
      }
      const list = await getUsers();
      setUsers(list);
      setFormVisible(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      setFormMode(FORM_MODES.CREATE);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Kullanici kaydedilirken bir hata olustu."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmation = window.confirm("Bu kullanici silinsin mi?");
    if (!confirmation) {
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteUser(id);
      const list = await getUsers();
      setUsers(list);
      setSuccess("Kullanici silindi.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Kullanici silinirken bir hata olustu."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setFormVisible(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setFormMode(FORM_MODES.CREATE);
    setUsers([]);
    setSuccess("");
    setError("");
    navigate("/", { replace: true });
  };

  const handleClearLoginError = () => {
    if (error) {
      setError("");
    }
  };

  const renderFeedback = () => {
    if (!error && !success) {
      return null;
    }
    const variantClass = error ? "alert-danger" : "alert-success";
    const message = error || success;
    return (
      <div className={`alert ${variantClass} mt-3`} role="alert">
        {message}
      </div>
    );
  };

  const feedbackElement = renderFeedback();
  const isCreateMode = formMode === FORM_MODES.CREATE;
  const isRoleMode = formMode === FORM_MODES.ROLE;
  const formTitle = isCreateMode
    ? "Yeni Kullanici"
    : isRoleMode
    ? "Kullanici Rolu Guncelle"
    : "Kullaniciyi Guncelle";
  const formSubmitLabel = isCreateMode
    ? "Kaydet"
    : isRoleMode
    ? "Rol Kaydet"
    : "Guncelle";

  return (
    <div>
      {isAuthenticated && (
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
      )}
      <div className={isAuthenticated ? "dashboard-shell" : "container py-4"}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/users" replace />
              ) : (
                <div>
                  <Login
                    onLogin={handleLogin}
                    loading={loading}
                    errorMessage={error}
                    successMessage={success}
                    onClearError={handleClearLoginError}
                  />
                </div>
              )
            }
          />
          <Route
            path="/users"
            element={
              isAuthenticated ? (
                <div className="dashboard-container">
                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <div>
                        <h2 className="dashboard-card-title">
                          Kullanici Listesi
                        </h2>
                        <div className="dashboard-meta">
                          <span>Toplam {users.length} kayitli kullanici</span>
                          {currentUser?.email && (
                            <span>
                              Yonetici girisi: {currentUser.name} (
                              {currentUser.email})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="dashboard-toolbar">
                        {currentUser?.name && (
                          <span className="dashboard-user">
                            {currentUser.name}
                          </span>
                        )}
                        <button
                          type="button"
                          className="dashboard-primary"
                          onClick={handleCreateUserForm}
                        >
                          Yeni Kullanici
                        </button>
                      </div>
                    </div>
                    {feedbackElement && (
                      <div className="dashboard-feedback">
                        {feedbackElement}
                      </div>
                    )}
                    <div className="user-table-wrapper">
                      <UserList
                        users={users}
                        loading={loading}
                        onEdit={handleEditUserForm}
                        onRole={handleRoleForm}
                        onDelete={handleDelete}
                      />
                    </div>
                    {formVisible && (
                      <div className="dashboard-form-modal" ref={formRef}>
                        <UserForm
                          initialData={formData}
                          isEditing={!isCreateMode}
                          showRoleField={isRoleMode}
                          title={formTitle}
                          submitLabel={formSubmitLabel}
                          loading={loading}
                          onCancel={() => {
                            setFormVisible(false);
                            setFormData({ ...emptyForm });
                            setEditingId(null);
                            setFormMode(FORM_MODES.CREATE);
                          }}
                          onSubmit={handleFormSubmit}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
