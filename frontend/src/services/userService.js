import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

let activeToken = null;

const TOKEN_KEY = "access_token";

const api = axios.create({
  baseURL: API_BASE_URL
});

const setAuthHeader = (token) => {
  activeToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
  persistToken(token);
};

const persistToken = (token) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
};

const readStoredToken = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const stored = window.localStorage.getItem(TOKEN_KEY);
  return stored || null;
};

export const getUsers = async () => {
  const response = await api.get("/users/");
  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", {
    email,
    password
  });

  const { access_token: accessToken, token_type: tokenType } = response.data;
  if (!accessToken) {
    throw new Error("Geçersiz giriş yanıtı alındı.");
  }

  setAuthHeader(accessToken);

  return {
    accessToken,
    tokenType,
    email
  };
};

export const clearSession = () => {
  setAuthHeader(null);
};

export const createUser = async (payload) => {
  const response = await api.post("/users/", payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};

export const setUserSalary = async (userId, salary) => {
  const token = readStoredToken();
  if (!token) {
    throw new Error("Oturum belirteci bulunamadı.");
  }
  const response = await api.post(
    `/users/${userId}/salary`,
    {
      salary
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export default {
  getUsers,
  loginUser,
  createUser,
  updateUser,
  deleteUser,
  clearSession,
  setUserSalary
};
