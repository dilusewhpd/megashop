const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ===================== GET CART =====================
exports.getCart = async (req, res) => {
  try {
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
        p.original_price,
        p.price,
        p.discount,
        p.images
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      `,
      [userId]
    );

    const cartItems = rows.map((item) => {
      const images =
        !item.images || item.images.length === 0
          ? ["placeholder.jpeg"]
          : typeof item.images === "string"
          ? JSON.parse(item.images)
          : item.images;

      const originalPrice = Number(item.original_price || item.price || 0);
      const discount = Number(item.discount || 0);
      const finalPrice = originalPrice - (originalPrice * discount) / 100;

      return {
        ...item,
        images,
        original_price: originalPrice,
        discount,
        finalPrice,
      };
    });

    return res.json({ cart: cartItems });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== ADD TO CART =====================
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, selectedColor = null, selectedSize = null } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });

    const [prod] = await db.query("SELECT id FROM products WHERE id = ?", [productId]);
    if (prod.length === 0) return res.status(404).json({ message: "Product not found" });

    const [existing] = await db.query(
      `SELECT id, quantity FROM cart_items 
       WHERE user_id = ? AND product_id = ? 
       AND (selected_color <=> ?) AND (selected_size <=> ?)`,
      [userId, productId, selectedColor, selectedSize]
    );

    if (existing.length > 0) {
      await db.query("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [
        quantity,
        existing[0].id,
      ]);
      return res.status(200).json({ message: "Cart updated ✅" });
    }

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

// ===================== UPDATE CART ITEM =====================
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    const [rows] = await db.query("SELECT id FROM cart_items WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) return res.status(404).json({ message: "Cart item not found" });

    await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, id]);
    return res.json({ message: "Cart item updated ✅" });
  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== REMOVE CART ITEM =====================
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [rows] = await db.query("SELECT id FROM cart_items WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) return res.status(404).json({ message: "Cart item not found" });

    await db.query("DELETE FROM cart_items WHERE id = ?", [id]);
    return res.json({ message: "Item removed from cart ✅" });
  } catch (err) {
    console.error("REMOVE CART ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== CLEAR CART =====================
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    await db.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    return res.json({ message: "Cart cleared ✅" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ===================== APPLY PROMO =====================
exports.applyPromo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code) return res.status(400).json({ message: "Promo code is required" });

    const [promoRows] = await db.query("SELECT * FROM promo_codes WHERE code = ? AND active = 1", [code]);
    if (promoRows.length === 0) return res.status(400).json({ success: false, message: "Invalid promo code" });

    const promo = promoRows[0];

    const [cartRows] = await db.query(
      `SELECT c.quantity, COALESCE(p.discount, 0) AS discount, COALESCE(p.price, 0) AS price, COALESCE(p.original_price, p.price, 0) AS original_price
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (cartRows.length === 0) return res.status(400).json({ message: "Cart is empty" });

    let cartTotal = 0;
    cartRows.forEach(item => {
      const finalPrice = item.original_price - (item.original_price * item.discount) / 100;
      cartTotal += finalPrice * item.quantity;
    });

    if (promo.min_order_amount && cartTotal < promo.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order RS.${promo.min_order_amount} required`,
      });
    }

    let discountAmount = promo.discount_type === "percentage"
      ? (cartTotal * promo.discount_value) / 100
      : promo.discount_value;

    const newTotal = cartTotal - discountAmount;

    return res.json({
      success: true,
      promoId: promo.id,
      discountAmount: discountAmount.toFixed(2),
      newTotal: newTotal.toFixed(2),
      message: `Promo code applied successfully!`,
    });
  } catch (err) {
    console.error("APPLY PROMO ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== PROMO BANNERS FOR HOME =====================
exports.getPromoBanners = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        id,
        code,
        title,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        image_url
       FROM promo_codes
       WHERE active = 1
       ORDER BY id DESC`
    );

    return res.json({ promos: rows });
  } catch (err) {
    console.error("GET PROMO BANNERS ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};