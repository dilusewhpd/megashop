const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../utils/tokenBlacklist");

module.exports = function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = header.split(" ")[1];

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: "Token is invalidated. Please login again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};