const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getCart , addToCart } = require("../controllers/cartController");

// GET /cart (protected)
router.get("/", authMiddleware, getCart);

// POST /cart (protected)
router.post("/", authMiddleware, addToCart);

module.exports = router;