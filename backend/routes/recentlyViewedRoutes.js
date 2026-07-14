const express = require("express");
const router = express.Router();
const { trackView, getRecentlyViewed } = require("../controllers/recentlyViewedController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/", getRecentlyViewed);
router.post("/:tmdbId", trackView);

module.exports = router;