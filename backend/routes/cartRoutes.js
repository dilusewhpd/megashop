const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getCart , addToCart , updateCartItem , removeCartItem ,clearCart } = require("../controllers/cartController");

// GET /cart (protected)
router.get("/", authMiddleware, getCart);

// POST /cart (protected)
router.post("/", authMiddleware, addToCart);

// PUT /cart/:id (protected)
router.put("/:id", authMiddleware, updateCartItem);

// DELETE /cart/:id (protected)
router.delete("/:id", authMiddleware, removeCartItem);

// DELETE /cart (protected) - Clear entire cart
router.delete("/", authMiddleware, clearCart);

module.exports = router;