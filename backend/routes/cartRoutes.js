const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyPromo,
  getPromoBanners,
} = require("../controllers/cartController");

// GET /cart
router.get("/", authMiddleware, getCart);

// POST /cart
router.post("/", authMiddleware, addToCart);

// PUT /cart/:id
router.put("/:id", authMiddleware, updateCartItem);

// DELETE /cart/:id
router.delete("/:id", authMiddleware, removeCartItem);

// DELETE /cart - clear all
router.delete("/", authMiddleware, clearCart);

// GET /cart/promos - get active promo banners
router.get("/promos", authMiddleware, getPromoBanners);

// POST /cart/apply-promo
router.post("/apply-promo", authMiddleware, applyPromo);

module.exports = router;