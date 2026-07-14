const tmdbService = require("./tmdbService");
const { computeMovieScore } = require("../utils/scoring");

const MAX_GENRES = 2;

/**
 * Applies our own filters against a list of candidate movies that TMDB
 * couldn't fully filter for us (used on the director-first path below,
 * where candidates come from a person's filmography rather than /discover).
 */
function applyManualFilters(movies, filters) {
  return movies.filter((m) => {
    if (filters.genreIds?.length) {
      const hasAllGenres = filters.genreIds.every((g) => m.genre_ids?.includes(g));
      if (!hasAllGenres) return false;
    }
    if (filters.minRating && m.vote_average < filters.minRating) return false;
    if (filters.yearFrom || filters.yearTo) {
      const year = m.release_date ? Number(m.release_date.slice(0, 4)) : null;
      if (!year) return false;
      if (filters.yearFrom && year < filters.yearFrom) return false;
      if (filters.yearTo && year > filters.yearTo) return false;
    }
    if (filters.language && m.original_language !== filters.language) return false;
    return true;
  });
}

/**
 * Path used when a director filter is present. TMDB's /discover/movie has
 * no native director param, so we pull the full filmography (small, complete
 * list) and filter/rank it ourselves instead of paginating /discover.
 */
async function discoverByDirector(filters) {
  // Single call returns the full filmography with genre_ids, rating,
  // popularity, and release_date already attached - no extra per-movie calls.
  const directedMovies = await tmdbService.getDirectorFilmography(filters.directorId);

  let candidates = applyManualFilters(directedMovies, filters);

  // Actor filter combined with director filter: check cast on the surviving
  // (already small) candidate set only, to keep the number of extra API
  // calls bounded rather than checking every movie a director ever made.
  if (filters.actorIds?.length) {
    const withCastChecked = await Promise.all(
      candidates.map(async (m) => {
        const details = await tmdbService.getMovieDetails(m.id);
        const castIds = (details.credits?.cast || []).map((c) => c.id);
        const hasAllActors = filters.actorIds.every((id) => castIds.includes(id));
        return hasAllActors ? m : null;
      })
    );
    candidates = withCastChecked.filter(Boolean);
  }

  // Runtime isn't in the credits payload - only fetch details (for runtime
  // check) on the remaining small candidate set, not the whole filmography.
  if (filters.runtimeMin || filters.runtimeMax) {
    const withRuntimeChecked = await Promise.all(
      candidates.map(async (m) => {
        const details = await tmdbService.getMovieDetails(m.id);
        if (filters.runtimeMin && details.runtime < filters.runtimeMin) return null;
        if (filters.runtimeMax && details.runtime > filters.runtimeMax) return null;
        return m;
      })
    );
    candidates = withRuntimeChecked.filter(Boolean);
  }

  return candidates;
}

/**
 * Path used when there's no director filter. Prefers TMDB's native discover
 * params wherever possible (fast, single call). If a title search string is
 * given, TMDB's /discover doesn't support text search, so we use /search/movie
 * instead and apply the remaining filters ourselves on that result set.
 */
async function discoverWithoutDirector(filters, page) {
  if (filters.title) {
    const searchResult = await tmdbService.searchMoviesByTitle(filters.title, page);
    const filtered = applyManualFilters(searchResult.results, filters);
    return { results: filtered, total_results: filtered.length, total_pages: searchResult.total_pages };
  }

  const discoverResult = await tmdbService.discoverMovies(filters, page);
  return discoverResult;
}

/**
 * Main entry point. Returns movies matching the given filters, ranked by our
 * own composite score (see utils/scoring.js) rather than TMDB's raw order.
 */
async function discoverMovies(filters = {}, page = 1) {
  if (filters.genreIds?.length > MAX_GENRES) {
    filters.genreIds = filters.genreIds.slice(0, MAX_GENRES);
  }

  const { results, total_results, total_pages } = filters.directorId
    ? { results: await discoverByDirector(filters), total_results: undefined, total_pages: 1 }
    : await discoverWithoutDirector(filters, page);

  const scored = results
    .map((movie) => ({ ...movie, matchScore: computeMovieScore(movie) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    page,
    results: scored,
    totalResults: total_results ?? scored.length,
    totalPages: total_pages ?? 1,
  };
}

module.exports = { discoverMovies };