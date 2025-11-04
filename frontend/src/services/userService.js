import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

let activeToken = null;

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
    throw new Error("Gecersiz giris yaniti alindi.");
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

export default {
  getUsers,
  loginUser,
  createUser,
  updateUser,
  deleteUser,
  clearSession
};
