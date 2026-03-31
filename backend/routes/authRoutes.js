const express = require("express");
const router = express.Router();

const { register, login, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /auth/register
router.post("/register", register);
// POST /auth/login
router.post("/login", login);
// POST /auth/logout
router.post("/logout", authMiddleware, logout); 

module.exports = router;