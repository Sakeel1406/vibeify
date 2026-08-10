const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Strict Auth Guard (Blocks requests if user is not logged in)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support both decoded.id and decoded._id JWT payloads
      req.user = await User.findById(decoded.id || decoded._id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

//  Optional Auth Guard (Allows Guests through, but populates req.user if Token exists)
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Support both decoded.id and decoded._id JWT payloads
      req.user = await User.findById(decoded.id || decoded._id).select("-password");
    } catch (error) {
      // If token is invalid or expired, continue seamlessly in guest mode
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

// 3. Authorization Guard (Restricts access to Admin role)
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
};

module.exports = { protect, optionalProtect, admin };