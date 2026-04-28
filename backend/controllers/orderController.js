const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ===================== CHECKOUT =====================
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      shippingAddress = {},
      paymentMethod = "COD",
      paymentStatus = "Pending",
      promoCode = null,
    } = req.body;

    // 1) Get cart items
    const cartResult = await db.query(
      `
      SELECT c.quantity, p.price, p.id AS product_id
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2) Calculate subtotal
    let subtotal = 0;
    cartResult.rows.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    // 3) Promo discount
    let discount_amount = 0;

    if (promoCode) {
      const promoResult = await db.query(
        "SELECT * FROM promo_codes WHERE code = $1 AND is_active = true",
        [promoCode]
      );

      if (promoResult.rows.length > 0) {
        const promo = promoResult.rows[0];

        if (promo.discount_type === "percentage") {
          discount_amount = (subtotal * promo.discount_value) / 100;
        } else {
          discount_amount = promo.discount_value;
        }
      }
    }

    // 4) Total
    const total =
      req.body.totalAmount || subtotal - discount_amount;

    // 5) Create order
    const orderId = uuidv4();
    const orderNumber = "ORD-" + Date.now();

    await db.query(
      `
      INSERT INTO orders
      (id, user_id, order_number, status, discount_amount, total, shipping_address, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        orderId,
        userId,
        orderNumber,
        paymentStatus,
        discount_amount,
        total,
        JSON.stringify(shippingAddress),
        paymentMethod,
      ]
    );

    // 6) Insert order items
    for (const item of cartResult.rows) {
      await db.query(
        `
        INSERT INTO order_items
        (id, order_id, product_id, quantity, price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          uuidv4(),
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          item.price * item.quantity,
        ]
      );
    }

    // 7) Clear cart
    await db.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    return res.status(201).json({
      message: "Order placed successfully ✅",
      orderNumber,
      total,
      discount_amount,
      status: paymentStatus,
    });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== CREATE PAYMENT =====================
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber, amount } = req.body;

    const orderResult = await db.query(
      "SELECT total, id FROM orders WHERE order_number = $1 AND user_id = $2",
      [orderNumber, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderResult.rows[0];
    const finalAmount = amount || order.total;

    return res.json({
      merchant_id: "YOUR_MERCHANT_ID",
      return_url: "http://localhost:5000/payment/success",
      cancel_url: "http://localhost:5000/payment/cancel",
      notify_url: "http://localhost:5000/payment/notify",
      order_id: orderNumber,
      items: "Order Payment",
      currency: "LKR",
      amount: finalAmount,
      first_name: "CustomerFirstName",
      last_name: "CustomerLastName",
      email: "customer@example.com",
      phone: "0712345678",
      address: "",
      city: "",
      country: "Sri Lanka",
    });
  } catch (err) {
    console.error("PAYMENT CREATE ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== GET MY ORDERS =====================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `
      SELECT id, order_number, status, discount_amount, total, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({ orders: result.rows });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== GET ORDER BY NUMBER =====================
exports.getOrderByNumber = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;

    const orderResult = await db.query(
      `
      SELECT id, order_number, status, discount_amount, total,
             shipping_address, payment_method, created_at
      FROM orders
      WHERE user_id = $1 AND order_number = $2
      `,
      [userId, orderNumber]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderResult.rows[0];

    const itemsResult = await db.query(
      `
      SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.total_price,
             p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      `,
      [order.id]
    );

    return res.json({ order, items: itemsResult.rows });
  } catch (err) {
    console.error("GET ORDER DETAILS ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== UPDATE ORDER STATUS =====================
exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;
    const { status } = req.body;

    await db.query(
      `UPDATE orders SET status = $1 WHERE user_id = $2 AND order_number = $3`,
      [status, userId, orderNumber]
    );

    return res.json({ message: "Order status updated ✅", status });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== DELETE ORDER =====================
exports.deleteOrderByNumber = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;

    const result = await db.query(
      "DELETE FROM orders WHERE order_number = $1 AND user_id = $2",
      [orderNumber, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order deleted successfully ✅" });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};