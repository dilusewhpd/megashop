const express = require("express");
const router = express.Router();

const { getProducts , getProductById, getCategories  } = require("../controllers/productController");

// GET /products
router.get("/", getProducts);

// GET /products/categories
router.get("/categories", getCategories);

// GET /products/:id
router.get("/:id", getProductById);

module.exports = router;