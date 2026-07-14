const express = require("express");
const router = express.Router();
const {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  checkWatchlist,
} = require("../controllers/watchlistController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/", getWatchlist);
router.get("/:tmdbId/check", checkWatchlist);
router.post("/:tmdbId", addToWatchlist);
router.delete("/:tmdbId", removeFromWatchlist);

module.exports = router;