const MovieStats = require("../models/MovieStats");
const asyncHandler = require("express-async-handler");
const tmdbService = require("../services/tmdbService");

// @desc    Get trending movies (this week)
// @route   GET /api/movies/trending
// @access  Public
const getTrending = asyncHandler(async (req, res) => {
  const results = await tmdbService.getTrending();
  res.json({ success: true, data: results });
});

// @desc    Get popular movies
// @route   GET /api/movies/popular
// @access  Public
const getPopular = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const results = await tmdbService.getPopular(page);
  res.json({ success: true, data: results });
});

const getMostPopular = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const results = await tmdbService.getMostPopular(page);
  res.json({ success: true, data: results });
});

// @desc    Get top rated movies
// @route   GET /api/movies/top-rated
// @access  Public
const getTopRated = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const results = await tmdbService.getTopRated(page);
  res.json({ success: true, data: results });
});

// @desc    Get recently released movies
// @route   GET /api/movies/now-playing
// @access  Public
const getNowPlaying = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const results = await tmdbService.getNowPlaying(page);
  res.json({ success: true, data: results });
});

// @desc    Get the full genre list (id -> name), used to populate filter dropdowns
// @route   GET /api/movies/genres
// @access  Public
const getGenres = asyncHandler(async (req, res) => {
  const genres = await tmdbService.getGenreList();
  res.json({ success: true, data: genres });
});

// @desc    Get full details for a single movie (for the Movie Details page)
// @route   GET /api/movies/:tmdbId
// @access  Public
const getMovieDetails = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const details = await tmdbService.getMovieDetails(tmdbId);

  // Community rating is our own platform's aggregate - separate from TMDB's
  // official rating, and shown alongside it (per the product spec).
  const stats = await MovieStats.findOne({ tmdbId: Number(tmdbId) });

  res.json({
    success: true,
    data: {
      ...details,
      communityRating: stats?.avgRating || null,
      communityRatingCount: stats?.ratingCount || 0,
    },
  });
});

// @desc    Search for a person (director/actor) by name, for filter type-ahead
// @route   GET /api/movies/people/search?name=
// @access  Public
const searchPerson = asyncHandler(async (req, res) => {
  const { name } = req.query;
  if (!name || name.trim().length < 2) {
    res.status(400);
    throw new Error("Please provide at least 2 characters to search");
  }
  const results = await tmdbService.searchPerson(name.trim());
  res.json({ success: true, data: results });
});

module.exports = {
  getTrending,
  getPopular,
  getMostPopular,
  getTopRated,
  getNowPlaying,
  getGenres,
  getMovieDetails,
  searchPerson,
};
