const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// GET /user - get profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      "SELECT id, full_name, email, profile_image FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /user - update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, email, profileImage } = req.body;

    await db.query(
      "UPDATE users SET full_name = $1, email = $2, profile_image = $3 WHERE id = $4",
      [fullName, email, profileImage || null, userId]
    );

    res.json({ message: "Profile updated successfully ✅" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /user/profile-image
exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.query(
      "UPDATE users SET profile_image = NULL WHERE id = $1",
      [userId]
    );

    res.json({ message: "Profile image deleted ✅" });
  } catch (err) {
    console.error("Delete profile image error:", err);
    res.status(500).json({ message: "Server error" });
  }
};