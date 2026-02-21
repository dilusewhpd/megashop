const db = require("../config/db");

// Get Products
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

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ product: rows[0] });
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};