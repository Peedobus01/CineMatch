const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true }
);

// A user can only rate a given movie once — re-rating updates the existing doc
ratingSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
