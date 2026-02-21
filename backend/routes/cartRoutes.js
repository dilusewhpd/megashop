const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getCart , addToCart , updateCartItem , removeCartItem } = require("../controllers/cartController");

// GET /cart (protected)
router.get("/", authMiddleware, getCart);

// POST /cart (protected)
router.post("/", authMiddleware, addToCart);

// PUT /cart/:id (protected)
router.put("/:id", authMiddleware, updateCartItem);

// DELETE /cart/:id (protected)
router.delete("/:id", authMiddleware, removeCartItem);

module.exports = router;