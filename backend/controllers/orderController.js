const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ==============================
// PLACE ORDER (CHECKOUT)
// ==============================
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
    const [cart] = await db.query(
      `
      SELECT c.quantity, p.price, p.id AS product_id
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      `,
      [userId],
    );

    if (cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2) Calculate subtotal
    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    const tax = 0;
    const shipping = 0;

    // 3) Calculate discount_amount if promo applied
    let discount_amount = 0;
    if (promoCode) {
      const [promoRows] = await db.query(
        "SELECT * FROM promo_codes WHERE code = ? AND is_active = 1",
        [promoCode],
      );
      if (promoRows.length > 0) {
        const promo = promoRows[0];
        if (promo.discount_type === "percentage") {
          discount_amount = (subtotal * promo.discount_value) / 100;
        } else {
          discount_amount = promo.discount_value;
        }
      }
    }

    // 4) Calculate total
    const total = req.body.totalAmount || subtotal + tax + shipping - discount_amount;

    // 5) Create order
    const orderId = uuidv4();
    const orderNumber = "ORD-" + Date.now();

    await db.query(
      `
      INSERT INTO orders
      (id, user_id, order_number, status, subtotal, tax, shipping, discount_amount, total, shipping_address, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        userId,
        orderNumber,
        paymentStatus,
        subtotal,
        tax,
        shipping,
        discount_amount,
        total,
        JSON.stringify(shippingAddress),
        paymentMethod,
      ],
    );

    // 6) Insert order items
    const orderItemsValues = cart.map((item) => [
      uuidv4(),
      orderId,
      item.product_id,
      item.quantity,
      item.price,
      item.price * item.quantity,
    ]);

    if (orderItemsValues.length > 0) {
      await db.query(
        `
        INSERT INTO order_items
        (id, order_id, product_id, quantity, price, total_price)
        VALUES ?
        `,
        [orderItemsValues],
      );
    }

    // 7) Clear cart
    await db.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    // 🔹 Return orderNumber and total so frontend can send correct amount to PayHere
    return res.status(201).json({
      message: "Order placed successfully ✅",
      orderNumber,
      total, // 🔹 send total to frontend
      discount_amount,
      status: paymentStatus,
    });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ==============================
// CREATE PAYMENT (FIXED)
// ==============================
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber, amount } = req.body; // frontend must send orderNumber + total

    // 1) Fetch order from DB to ensure correct total
    const [orderRows] = await db.query(
      "SELECT total, id FROM orders WHERE order_number = ? AND user_id = ?",
      [orderNumber, userId],
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderRows[0];

    // 2) Use total from order (amount from frontend is optional)
    const finalAmount = amount || order.total;

    // 3) Prepare PayHere payment payload
    const paymentData = {
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
    };

    return res.json(paymentData);
  } catch (err) {
    console.error("PAYMENT CREATE ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ==============================
// OTHER CONTROLLERS (NO CHANGES NEEDED)
// ==============================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await db.query(
      `
      SELECT id, order_number, status, subtotal, tax, shipping, discount_amount, total, created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId],
    );
    return res.json({ orders: rows });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.getOrderByNumber = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;
    const [rows] = await db.query(
      `
      SELECT id, order_number, status, subtotal, tax, shipping, discount_amount, total,
             shipping_address, payment_method, created_at
      FROM orders
      WHERE user_id = ? AND order_number = ?
      `,
      [userId, orderNumber],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = rows[0];
    const [items] = await db.query(
      `
      SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.total_price,
             p.name AS product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      `,
      [order.id],
    );

    return res.json({ order, items });
  } catch (err) {
    console.error("GET ORDER DETAILS ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;
    const { status } = req.body;
    await db.query(
      `UPDATE orders SET status = ? WHERE user_id = ? AND order_number = ?`,
      [status, userId, orderNumber],
    );
    return res.json({ message: "Order status updated ✅", status });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.deleteOrderByNumber = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;
    const [result] = await db.query(
      "DELETE FROM orders WHERE order_number = ? AND user_id = ?",
      [orderNumber, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order deleted successfully ✅" });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
