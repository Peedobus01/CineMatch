const mongoose = require("mongoose");

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Same movie viewed again just updates viewedAt rather than duplicating
recentlyViewedSchema.index({ user: 1, tmdbId: 1 }, { unique: true });
// Efficient "most recent first" queries per user
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);
