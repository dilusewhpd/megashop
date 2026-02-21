const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Get Cart
exports.getCart = async (req, res) => {
  try {
    // user id from JWT
    const userId = req.user.userId;

    const [rows] = await db.query(
      `
      SELECT 
        c.id,
        c.quantity,
        c.selected_color,
        c.selected_size,
        p.id AS product_id,
        p.name,
        p.price,
        p.images
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      `,
      [userId]
    );

    return res.json({ cart: rows });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, selectedColor = null, selectedSize = null } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    // check if product exists
    const [prod] = await db.query("SELECT id FROM products WHERE id = ?", [productId]);
    if (prod.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // check if already in cart (same product + same options)
    const [existing] = await db.query(
      `SELECT id, quantity FROM cart_items 
       WHERE user_id = ? AND product_id = ? 
       AND (selected_color <=> ?) AND (selected_size <=> ?)`,
      [userId, productId, selectedColor, selectedSize]
    );

    if (existing.length > 0) {
      const cartId = existing[0].id;
      await db.query("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [
        quantity,
        cartId,
      ]);
      return res.status(200).json({ message: "Cart updated ✅" });
    }

    // insert new
    const cartItemId = uuidv4();
    await db.query(
      "INSERT INTO cart_items (id, user_id, product_id, quantity, selected_color, selected_size) VALUES (?, ?, ?, ?, ?, ?)",
      [cartItemId, userId, productId, quantity, selectedColor, selectedSize]
    );

    return res.status(201).json({ message: "Added to cart ✅" });
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};