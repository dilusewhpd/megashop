import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const API = API_BASE_URL;

export const getCartApi = async (token) => {
  const res = await axios.get(`${API}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const addToCartApi = async (productId, token) => {
  const res = await axios.post(
    `${API}/cart`,
    { productId, quantity: 1 },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const updateCartItemApi = async (id, quantity, token) => {
  const res = await axios.put(
    `${API}/cart/${id}`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteCartItemApi = async (id, token) => {
  const res = await axios.delete(`${API}/cart/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const clearCartApi = async (token) => {
  const res = await axios.delete(`${API}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// New API for applying promo code
export const applyPromoApi = async (code, token) => {
  const res = await axios.post(
    `${API}/cart/apply-promo`,
    { code },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// New API for fetching active promo banners
export const getPromoBannersApi = async (token) => {
  const res = await axios.get(`${API}/cart/promos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.promos;
};