import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const API_BASE = API_BASE_URL;

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