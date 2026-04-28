const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ===================== GET CART =====================
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
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
      WHERE c.user_id = $1
      `,
      [userId]
    );

    const rows = result.rows;

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

    if (!productId)
      return res.status(400).json({ message: "productId is required" });

    const prodResult = await db.query(
      "SELECT id FROM products WHERE id = $1",
      [productId]
    );

    if (prodResult.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    const existingResult = await db.query(
      `
      SELECT id, quantity 
      FROM cart_items 
      WHERE user_id = $1 
      AND product_id = $2 
      AND (selected_color IS NOT DISTINCT FROM $3)
      AND (selected_size IS NOT DISTINCT FROM $4)
      `,
      [userId, productId, selectedColor, selectedSize]
    );

    if (existingResult.rows.length > 0) {
      await db.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2",
        [quantity, existingResult.rows[0].id]
      );

      return res.status(200).json({ message: "Cart updated ✅" });
    }

    const cartItemId = uuidv4();

    await db.query(
      `
      INSERT INTO cart_items 
      (id, user_id, product_id, quantity, selected_color, selected_size)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
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

    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const check = await db.query(
      "SELECT id FROM cart_items WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (check.rows.length === 0)
      return res.status(404).json({ message: "Cart item not found" });

    await db.query(
      "UPDATE cart_items SET quantity = $1 WHERE id = $2",
      [quantity, id]
    );

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

    const check = await db.query(
      "SELECT id FROM cart_items WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (check.rows.length === 0)
      return res.status(404).json({ message: "Cart item not found" });

    await db.query("DELETE FROM cart_items WHERE id = $1", [id]);

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

    await db.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

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

    if (!code)
      return res.status(400).json({ message: "Promo code is required" });

    // ✅ FIXED HERE (is_active = true)
    const promoResult = await db.query(
      "SELECT * FROM promo_codes WHERE code = $1 AND is_active = true",
      [code]
    );

    if (promoResult.rows.length === 0)
      return res.status(400).json({
        success: false,
        message: "Invalid promo code",
      });

    const promo = promoResult.rows[0];

    const cartResult = await db.query(
      `
      SELECT 
        c.quantity,
        COALESCE(p.discount, 0) AS discount,
        COALESCE(p.price, 0) AS price,
        COALESCE(p.original_price, p.price, 0) AS original_price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      `,
      [userId]
    );

    const cartRows = cartResult.rows;

    if (cartRows.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    let cartTotal = 0;

    cartRows.forEach((item) => {
      const originalPrice = Number(item.original_price || item.price || 0);
      const discount = Number(item.discount || 0);

      const finalPrice =
        originalPrice - (originalPrice * discount) / 100;

      cartTotal += finalPrice * item.quantity;
    });

    if (promo.min_order_amount && cartTotal < promo.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order RS.${promo.min_order_amount} required`,
      });
    }

    let discountAmount =
      promo.discount_type === "percentage"
        ? (cartTotal * promo.discount_value) / 100
        : promo.discount_value;

    const newTotal = cartTotal - discountAmount;

    return res.json({
      success: true,
      promoId: promo.id,
      discountAmount: discountAmount.toFixed(2),
      newTotal: newTotal.toFixed(2),
      message: "Promo code applied successfully!",
    });
  } catch (err) {
    console.error("APPLY PROMO ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== PROMO BANNERS =====================
exports.getPromoBanners = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        id,
        code,
        title,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        image_url
      FROM promo_codes
      WHERE is_active = true
      ORDER BY id DESC
      `
    );

    return res.json({ promos: result.rows });
  } catch (err) {
    console.error("GET PROMO BANNERS ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};