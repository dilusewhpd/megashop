import { api } from "./client";

export const getProductsApi = () => api.get("/products");
export const getProductByIdApi = (id) => api.get(`/products/${id}`);