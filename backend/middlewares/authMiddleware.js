const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Protects routes: requires a valid Bearer token in the Authorization header
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password) to request object for downstream handlers
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User no longer exists");
      }

      return next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed or expired");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

module.exports = { protect };
