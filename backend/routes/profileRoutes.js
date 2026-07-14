const express = require("express");
const router = express.Router();
const { getMyProfile } = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/me", protect, getMyProfile);

module.exports = router;