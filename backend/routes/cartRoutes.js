const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getCart , addToCart , updateCartItem } = require("../controllers/cartController");

// GET /cart (protected)
router.get("/", authMiddleware, getCart);

// POST /cart (protected)
router.post("/", authMiddleware, addToCart);

// PUT /cart/:id (protected)
router.put("/:id", authMiddleware, updateCartItem);

module.exports = router;