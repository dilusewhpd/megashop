import { api } from "./client";

export const loginApi = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const registerApi = (fullName, email, password) => {
  return api.post("/auth/register", { fullName, email, password });
};