const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { checkout , getMyOrders , getOrderByNumber ,  updateOrderStatus, } = require("../controllers/orderController");

// POST /orders/checkout
router.post("/checkout", authMiddleware, checkout);

// GET /orders/my-orders
router.get("/my-orders", authMiddleware, getMyOrders);

// GET /orders/:orderNumber
router.get("/:orderNumber", authMiddleware, getOrderByNumber);  

// PATCH /orders/:orderNumber/pay
router.patch("/:orderNumber/pay", authMiddleware, updateOrderStatus);

module.exports = router;