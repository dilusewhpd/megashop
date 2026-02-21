require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");


console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
const db = require("./config/db");


const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ message: "MegaShop Backend is Running 🚀" });
});

// protected route example
app.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated ✅", user: req.user });
});

// test db connection
app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, result: rows[0].result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
