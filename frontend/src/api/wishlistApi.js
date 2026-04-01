import axios from "axios";

const API_BASE = "http://localhost:5000";

export const getWishlistApi = (token) =>
  axios.get(`${API_BASE}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addWishlistApi = (productId, token) =>
  axios.post(
    `${API_BASE}/wishlist`,
    { productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const removeWishlistApi = (productId, token) =>
  axios.delete(`${API_BASE}/wishlist/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

