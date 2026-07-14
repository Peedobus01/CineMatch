const asyncHandler = require("express-async-handler");
const discoveryService = require("../services/discoveryService");

// Parses raw query strings ("28,12") into typed arrays/numbers the service layer expects.
function parseFilters(query) {
  const filters = {};

  if (query.title) filters.title = query.title.trim();

  if (query.genreIds) {
    filters.genreIds = query.genreIds
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }

  if (query.directorId) filters.directorId = Number(query.directorId);

  if (query.actorIds) {
    filters.actorIds = query.actorIds
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }

  if (query.minRating) filters.minRating = Number(query.minRating);
  if (query.yearFrom) filters.yearFrom = Number(query.yearFrom);
  if (query.yearTo) filters.yearTo = Number(query.yearTo);
  if (query.runtimeMin) filters.runtimeMin = Number(query.runtimeMin);
  if (query.runtimeMax) filters.runtimeMax = Number(query.runtimeMax);
  if (query.language) filters.language = query.language.trim();

  return filters;
}

// @desc    Discover movies using structured filters, ranked by our own composite score
// @route   GET /api/discover
// @access  Public
const discover = asyncHandler(async (req, res) => {
  const filters = parseFilters(req.query);
  const page = Number(req.query.page) || 1;

  const result = await discoveryService.discoverMovies(filters, page);

  res.json({
    success: true,
    filtersApplied: filters,
    data: result,
  });
});

module.exports = { discover };