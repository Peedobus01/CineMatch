const asyncHandler = require("express-async-handler");
const RecentlyViewed = require("../models/RecentlyViewed");

const MAX_ENTRIES_PER_USER = 50;

// @desc    Record that the logged-in user viewed a movie's details page
// @route   POST /api/recently-viewed/:tmdbId
// @access  Private
const trackView = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);

  await RecentlyViewed.findOneAndUpdate(
    { user: req.user._id, tmdbId },
    { viewedAt: new Date() },
    { upsert: true, setDefaultsOnInsert: true }
  );

  const count = await RecentlyViewed.countDocuments({ user: req.user._id });
  if (count > MAX_ENTRIES_PER_USER) {
    const excess = count - MAX_ENTRIES_PER_USER;
    const oldest = await RecentlyViewed.find({ user: req.user._id })
      .sort({ viewedAt: 1 })
      .limit(excess)
      .select("_id");
    await RecentlyViewed.deleteMany({ _id: { $in: oldest.map((o) => o._id) } });
  }

  res.status(200).json({ success: true });
});

// @desc    Get the logged-in user's recently viewed movies (most recent first)
// @route   GET /api/recently-viewed
// @access  Private
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, MAX_ENTRIES_PER_USER);
  const entries = await RecentlyViewed.find({ user: req.user._id })
    .sort({ viewedAt: -1 })
    .limit(limit);
  res.json({ success: true, data: entries });
});

module.exports = { trackView, getRecentlyViewed };