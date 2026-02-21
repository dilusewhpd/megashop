const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { checkout , getMyOrders , getOrderByNumber  } = require("../controllers/orderController");

// POST /orders/checkout
router.post("/checkout", authMiddleware, checkout);

// GET /orders/my-orders
router.get("/", authMiddleware, getMyOrders);

// GET /orders/:orderNumber
router.get("/:orderNumber", authMiddleware, getOrderByNumber);  

module.exports = router;