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

// success & cancel routes
router.get("/success", (req, res) => {
  res.send("Payment successful");
});

router.get("/cancel", (req, res) => {
  res.send("Payment cancelled");
});

module.exports = router;

