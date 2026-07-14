const asyncHandler = require("express-async-handler");
const Rating = require("../models/Rating");
const MovieStats = require("../models/MovieStats");
const preferenceService = require("../services/preferenceService");

// @desc    Rate (and optionally review) a movie. Re-rating updates the existing entry.
// @route   POST /api/ratings/:tmdbId
// @access  Private
const rateMovie = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const existing = await Rating.findOne({ user: req.user._id, tmdbId });
  const oldValue = existing ? existing.rating : null;

  const updated = await Rating.findOneAndUpdate(
    { user: req.user._id, tmdbId },
    { rating, review: review || "" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await preferenceService.applyRatingChange(req.user._id, tmdbId, oldValue, rating);

  const stats = await MovieStats.findOne({ tmdbId });
  if (!stats) {
    await MovieStats.create({ tmdbId, ratingCount: 1, ratingSum: rating, avgRating: rating });
  } else if (oldValue === null) {
    const ratingCount = stats.ratingCount + 1;
    const ratingSum = stats.ratingSum + rating;
    await MovieStats.updateOne({ tmdbId }, { ratingCount, ratingSum, avgRating: ratingSum / ratingCount });
  } else {
    const ratingSum = stats.ratingSum - oldValue + rating;
    await MovieStats.updateOne({ tmdbId }, { ratingSum, avgRating: ratingSum / stats.ratingCount });
  }

  res.status(200).json({ success: true, data: updated });
});

// @desc    Get the logged-in user's own rating for a specific movie (if any)
// @route   GET /api/ratings/:tmdbId/me
// @access  Private
const getMyRatingForMovie = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const rating = await Rating.findOne({ user: req.user._id, tmdbId });
  res.json({ success: true, data: rating || null });
});

// @desc    Get all ratings the logged-in user has given (for the profile page)
// @route   GET /api/ratings/me
// @access  Private
const getMyRatings = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json({ success: true, data: ratings });
});

// @desc    Remove the logged-in user's rating for a movie
// @route   DELETE /api/ratings/:tmdbId
// @access  Private
const deleteRating = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);
  const existing = await Rating.findOne({ user: req.user._id, tmdbId });

  if (!existing) {
    res.status(404);
    throw new Error("No rating found for this movie");
  }

  await preferenceService.applyRatingChange(req.user._id, tmdbId, existing.rating, null);

  const stats = await MovieStats.findOne({ tmdbId });
  if (stats) {
    const ratingCount = Math.max(stats.ratingCount - 1, 0);
    const ratingSum = stats.ratingSum - existing.rating;
    await MovieStats.updateOne(
      { tmdbId },
      { ratingCount, ratingSum, avgRating: ratingCount === 0 ? 0 : ratingSum / ratingCount }
    );
  }

  await existing.deleteOne();
  res.json({ success: true, message: "Rating removed" });
});

module.exports = { rateMovie, getMyRatingForMovie, getMyRatings, deleteRating };