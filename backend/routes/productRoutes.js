const express = require("express");
const router = express.Router();

const { getProducts , getProductById  } = require("../controllers/productController");

// GET /products
router.get("/", getProducts);

// GET /products/:id
router.get("/:id", getProductById);

module.exports = router;