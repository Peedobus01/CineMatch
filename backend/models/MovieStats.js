const mongoose = require("mongoose");

// One document per TMDB movie that has ever been rated on our platform.
// avgRating is updated incrementally (O(1)) every time a rating is added,
// changed, or removed — no aggregation query needed on read.
const movieStatsSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovieStats", movieStatsSchema);
