const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  deleteProfileImage,
} = require("../controllers/userController");

// All routes protected
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.delete("/profile-image", authMiddleware, deleteProfileImage);


module.exports = router;