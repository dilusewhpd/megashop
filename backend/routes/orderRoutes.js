const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  checkout,
  getMyOrders,
  getOrderByNumber,
  updateOrderStatus,
  deleteOrderByNumber,
} = require("../controllers/orderController");

// POST /orders/checkout
router.post("/checkout", authMiddleware, checkout);

// GET /orders/my-orders
router.get("/my-orders", authMiddleware, getMyOrders);

// ✅ MOVE THIS UP (IMPORTANT FIX)
router.delete("/by-number/:orderNumber", authMiddleware, deleteOrderByNumber);

// PATCH /orders/:orderNumber/pay
router.patch("/:orderNumber/pay", authMiddleware, updateOrderStatus);

// ❌ KEEP THIS LAST
router.get("/:orderNumber", authMiddleware, getOrderByNumber);

module.exports = router;