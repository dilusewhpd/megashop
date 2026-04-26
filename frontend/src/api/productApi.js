import { api } from "./client";

export const getProductsApi = (filters = {}) => {
  const params = {};
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.category && filters.category !== "all") params.category = filters.category;
  if (filters.minRating && filters.minRating !== "all") params.minRating = filters.minRating;
  if (filters.priceRange && filters.priceRange !== "all") params.priceRange = filters.priceRange;

  return api.get("/products", { params });
};

export const getCategoriesApi = () => api.get("/products/categories");

export const getProductByIdApi = (id) => api.get(`/products/${id}`);