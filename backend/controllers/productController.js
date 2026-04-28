const db = require("../config/db");

// Get Products
exports.getProducts = async (req, res) => {
  try {
    const { sortBy, category, minRating, priceRange } = req.query;

    // Build the WHERE clause for filters
    let whereClause = "";
    let params = [];
    let paramIndex = 1;

    if (category && category !== "all") {
      whereClause += ` WHERE category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (minRating && minRating !== "all") {
      const ratingValue = parseFloat(minRating);
      if (whereClause) {
        whereClause += ` AND rating >= $${paramIndex}`;
      } else {
        whereClause += ` WHERE rating >= $${paramIndex}`;
      }
      params.push(ratingValue);
      paramIndex++;
    }

    if (priceRange && priceRange !== "all") {
      let priceCondition = "";
      if (priceRange === "under_1000") {
        priceCondition = "price < 1000";
      } else if (priceRange === "1000_2000") {
        priceCondition = "price >= 1000 AND price <= 2000";
      } else if (priceRange === "2000_5000") {
        priceCondition = "price >= 2000 AND price <= 5000";
      } else if (priceRange === "5000_10000") {
        priceCondition = "price >= 5000 AND price <= 10000";
      } else if (priceRange === "above_10000") {
        priceCondition = "price > 10000";
      }

      if (priceCondition) {
        if (whereClause) {
          whereClause += ` AND ${priceCondition}`;
        } else {
          whereClause += ` WHERE ${priceCondition}`;
        }
      }
    }

    // Build the ORDER BY clause based on sortBy parameter
    let orderBy = "id DESC"; // default

    if (sortBy === "price_low_to_high") {
      orderBy = "price ASC";
    } else if (sortBy === "price_high_to_low") {
      orderBy = "price DESC";
    } else if (sortBy === "newest") {
      orderBy = "id DESC";
    } else if (sortBy === "most_popular") {
      orderBy = "rating DESC, review DESC";
    } else if (sortBy === "most_sold") {
      orderBy = "sold_count DESC";
    }

    const result = await db.query(
      `SELECT id, name, price, original_price, discount, rating, review, sold_count, seller, category, images, badges
      FROM products${whereClause}
      ORDER BY ${orderBy}`,
      params
    );

    res.json({ products: result.rows });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get Categories
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category"
    );

    const categories = result.rows.map(row => row.category);
    res.json({ categories });
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ product: result.rows[0] });
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};