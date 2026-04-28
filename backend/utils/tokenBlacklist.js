const db = require("../config/db");

module.exports = {
  add: async (token, expiresAt) => {
    try {
      await db.query(
        "INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)",
        [token, expiresAt]
      );
    } catch (err) {
      console.error("Error adding token to blacklist:", err);
    }
  },

  has: async (token) => {
    try {
      const result = await db.query(
        "SELECT id FROM token_blacklist WHERE token = $1 AND expires_at > NOW()",
        [token]
      );
      return result.rows.length > 0;
    } catch (err) {
      console.error("Error checking token blacklist:", err);
      return false;
    }
  },

  cleanup: async () => {
    try {
      await db.query("DELETE FROM token_blacklist WHERE expires_at <= NOW()");
    } catch (err) {
      console.error("Error cleaning up token blacklist:", err);
    }
  }
};