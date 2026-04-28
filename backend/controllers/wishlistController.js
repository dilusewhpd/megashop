const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// ✅ ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    // prevent duplicate
    const existsResult = await db.query(
      "SELECT * FROM wishlist WHERE user_id=$1 AND product_id=$2",
      [userId, productId]
    );

    if (existsResult.rows.length > 0) {
      return res.json({ message: "Already in wishlist" });
    }

    await db.query(
      "INSERT INTO wishlist (id, user_id, product_id) VALUES ($1, $2, $3)",
      [uuidv4(), userId, productId]
    );

    res.json({ message: "Added to wishlist ❤️" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error" });
  }
};

// ✅ GET WISHLIST
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(`
      SELECT w.id, p.id as product_id, p.name, p.price, p.images
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
    `, [userId]);

    const wishlistWithImages = result.rows.map(item => {
      let imagesArray = [];
      try {
        imagesArray = item.images ? JSON.parse(item.images) : [];
        if (!Array.isArray(imagesArray)) imagesArray = [];
      } catch (err) {
        // fallback if JSON.parse fails (like plain string)
        imagesArray = item.images ? [item.images] : [];
      }

      return {
        ...item,
        images: imagesArray
      };
    });

    res.json({ wishlist: wishlistWithImages });
  } catch (err) {
    console.log("Wishlist fetch error:", err); // log the actual error
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};

// ✅ REMOVE
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    await db.query(
      "DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2",
      [userId, productId]
    );

    res.json({ message: "Removed from wishlist ❌" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};