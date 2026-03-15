const crypto = require("crypto");
const db = require("../config/db");

// ✅ Create PayHere payment
exports.createPayHerePayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.body;

    // 1️⃣ Get order from DB
    const [rows] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? AND order_number = ?",
      [userId, orderNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = rows[0];

    // 2️⃣ Ensure order.total exists
    if (!order.total) {
      return res.status(400).json({ message: "Order total not set" });
    }

    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    const amount = Number(order.total).toFixed(2); // ✅ exact total stored in DB
    const currency = "LKR";

    // 3️⃣ Hash generation for PayHere
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchant_secret)
      .digest("hex")
      .toUpperCase();

    const hash = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order.order_number +
          amount +
          currency +
          hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    // 4️⃣ Send all required fields to frontend
    res.json({
      sandbox: true, // PayHere sandbox mode
      merchant_id,
      return_url: "http://localhost:5000/payment/success",
      cancel_url: "http://localhost:5000/payment/cancel",
      notify_url: process.env.PAYHERE_NOTIFY_URL,

      order_id: order.order_number,
      items: "MegaShop Order",

      currency,
      amount,

      first_name: order.customer_name || "Customer",
      last_name: "",
      email: order.email || "customer@email.com",
      phone: order.phone || "0770000000",

      address: order.address || "Sri Lanka",
      city: "Colombo",
      country: "Sri Lanka",

      hash,
    });
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ PayHere IPN (notification)
exports.payHereNotify = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    // 1️⃣ Validate hash
    const localMd5 = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          crypto
            .createHash("md5")
            .update(merchant_secret)
            .digest("hex")
            .toUpperCase()
      )
      .digest("hex")
      .toUpperCase();

    if (localMd5 !== md5sig) {
      return res.status(400).send("Invalid signature");
    }

    // 2️⃣ Update order status if payment successful
    if (status_code == 2) {
      await db.query("UPDATE orders SET status = ? WHERE order_number = ?", [
        "paid",
        order_id,
      ]);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("NOTIFY ERROR:", err);
    res.sendStatus(500);
  }
};