import { api } from "./client";

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