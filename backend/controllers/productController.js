const db = require("../config/db");

exports.getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, price, original_price, rating, review_count, sold_count, seller, category, images, badges FROM products"
    );

    res.json({ products: rows });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};