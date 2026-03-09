import axios from "axios";

const API_BASE = "http://YOUR_BACKEND_URL"; // example: http://192.168.1.5:5000

export const checkoutOrderApi = async (token) => {
  return axios.post(
    `${API_BASE}/orders/checkout`,
    {
      paymentMethod: "ONLINE",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const createPaymentApi = async (orderNumber, token) => {
  return axios.post(
    `${API_BASE}/payment/create`,
    { orderNumber },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};