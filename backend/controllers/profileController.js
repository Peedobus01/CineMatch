const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Rating = require("../models/Rating");
const Watchlist = require("../models/Watchlist");

// @desc    Get the logged-in user's full profile: stats, preferences, chart data
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const [watchlistCount, reviewCount, ratingDistributionRaw] = await Promise.all([
    Watchlist.countDocuments({ user: user._id }),
    Rating.countDocuments({ user: user._id, review: { $ne: "" } }),
    Rating.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
  ]);

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
    const match = ratingDistributionRaw.find((r) => r._id === star);
    return { star, count: match ? match.count : 0 };
  });

  res.json({
    success: true,
    data: {
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      accountCreatedAt: user.createdAt,
      totalMoviesRated: user.preferences.totalRatingsGiven,
      averageRatingGiven: user.preferences.averageRatingGiven,
      favouriteGenres: user.preferences.favouriteGenres,
      favouriteDirectors: user.preferences.favouriteDirectors,
      favouriteActors: user.preferences.favouriteActors,
      watchlistCount,
      reviewCount,
      ratingDistribution,
    },
  });
});

module.exports = { getMyProfile };