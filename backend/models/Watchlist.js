const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
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
  },
  { timestamps: true } // createdAt acts as "date added"
);

watchlistSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model("Watchlist", watchlistSchema);
