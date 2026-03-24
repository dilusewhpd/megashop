const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Place Order (Checkout)
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Accept paymentStatus from frontend (default "Pending")
    const {
      shippingAddress = {},
      paymentMethod = "COD",
      paymentStatus = "Pending",
    } = req.body;

    // 1) Get cart items
    const [cart] = await db.query(
      `
      SELECT c.quantity, p.price
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
    const discount = 0;
    const total = subtotal + tax + shipping - discount;

    // 3) Create order
    const orderId = uuidv4();
    const orderNumber = "ORD-" + Date.now();

    await db.query(
      `
      INSERT INTO orders
      (id, user_id, order_number, status, subtotal, tax, shipping, discount, total, shipping_address, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        userId,
        orderNumber,
        paymentStatus, // ← use the status from frontend
        subtotal,
        tax,
        shipping,
        discount,
        total,
        JSON.stringify(shippingAddress),
        paymentMethod,
      ],
    );

    // 4) Clear cart
    await db.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    return res.status(201).json({
      message: "Order placed successfully ✅",
      orderNumber,
      total,
      status: paymentStatus, // return actual status
    });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// Get My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      `
      SELECT id, order_number, status, total, created_at
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

// Get Order Details by Order Number
exports.getOrderByNumber = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;

    const [rows] = await db.query(
      `
      SELECT id, order_number, status, subtotal, tax, shipping, discount, total,
            shipping_address, payment_method, created_at
      FROM orders
      WHERE user_id = ? AND order_number = ?
      `,
      [userId, orderNumber],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ order: rows[0] });
  } catch (err) {
    console.error("GET ORDER DETAILS ERROR:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// PATCH /orders/:orderNumber/pay
exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderNumber } = req.params;
    const { status } = req.body; // expect "Paid"

    const [rows] = await db.query(
      `UPDATE orders
       SET status = ?
       WHERE user_id = ? AND order_number = ?`,
      [status, userId, orderNumber]
    );

    return res.json({ message: "Order status updated ✅", status });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /orders/by-number/:orderNumber
exports.deleteOrderByNumber = async (req, res) => {
  try {
    console.log("🔥 DELETE API HIT"); // ✅ ADD

    const userId = req.user.userId;
    const { orderNumber } = req.params;

    console.log("OrderNumber:", orderNumber); // ✅ ADD

    const [result] = await db.query(
      "DELETE FROM orders WHERE order_number = ? AND user_id = ?",
      [orderNumber, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order deleted successfully ✅" });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};