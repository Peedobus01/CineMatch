const express = require("express");
const router = express.Router();
const {
  rateMovie,
  getMyRatingForMovie,
  getMyRatings,
  deleteRating,
} = require("../controllers/ratingController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect); // every rating route requires a logged-in user

router.get("/me", getMyRatings);
router.get("/:tmdbId/me", getMyRatingForMovie);
router.post("/:tmdbId", rateMovie);
router.delete("/:tmdbId", deleteRating);

module.exports = router;