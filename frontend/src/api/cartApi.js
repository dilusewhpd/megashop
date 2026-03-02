import { api } from "./client";

// Cart APIs
export const addToCartApi = (productId, token) => {
  return api.post(
    "/cart",
    { productId, quantity: 1 },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Get cart items
export const getCartApi = (token) => {
  return api.get("/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
};