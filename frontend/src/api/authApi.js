import { api } from "./client";

export const loginApi = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const registerApi = (fullName, email, password) => {
  return api.post("/auth/register", { fullName, email, password });
};

export const logoutApi = (token) => {
  return api.post("/auth/logout", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};