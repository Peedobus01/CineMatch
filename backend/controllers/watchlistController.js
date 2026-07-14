const asyncHandler = require("express-async-handler");
const Watchlist = require("../models/Watchlist");

// @desc    Add a movie to the logged-in user's watchlist
// @route   POST /api/watchlist/:tmdbId
// @access  Private
const addToWatchlist = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);

  const entry = await Watchlist.findOneAndUpdate(
    { user: req.user._id, tmdbId },
    { user: req.user._id, tmdbId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, data: entry });
});

// @desc    Remove a movie from the watchlist
// @route   DELETE /api/watchlist/:tmdbId
// @access  Private
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  await Watchlist.findOneAndDelete({ user: req.user._id, tmdbId });
  res.json({ success: true, message: "Removed from watchlist" });
});

// @desc    Get the logged-in user's full watchlist (most recently added first)
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = asyncHandler(async (req, res) => {
  const entries = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: entries });
});

// @desc    Check whether a specific movie is already in the user's watchlist
// @route   GET /api/watchlist/:tmdbId/check
// @access  Private
const checkWatchlist = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const entry = await Watchlist.findOne({ user: req.user._id, tmdbId });
  res.json({ success: true, data: { inWatchlist: !!entry } });
});

module.exports = { addToWatchlist, removeFromWatchlist, getWatchlist, checkWatchlist };