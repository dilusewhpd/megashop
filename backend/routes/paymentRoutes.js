const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createPayHerePayment,
  payHereNotify,
} = require("../controllers/paymentController");

// create payment
router.post("/create", authMiddleware, createPayHerePayment);

// webhook
router.post("/notify", payHereNotify);

module.exports = router;