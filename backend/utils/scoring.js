/**
 * Computes a single composite score (roughly 0-10) for a movie so our own
 * ranking can override TMDB's single-field sort.
 *
 * Uses a Bayesian/weighted rating (the same idea IMDB uses) so a movie with
 * a handful of 10/10 votes doesn't outrank a movie with 50,000 votes
 * averaging 8.2. Blended with normalized popularity so a well-reviewed but
 * completely obscure title doesn't dominate over movies people are actually
 * discussing right now.
 */

const MIN_VOTES_THRESHOLD = 50; // "m" in the weighted rating formula
const GLOBAL_AVERAGE_RATING = 6.5; // "C" - a reasonable prior for an unknown movie
const RATING_WEIGHT = 0.7;
const POPULARITY_WEIGHT = 0.3;
const MAX_EXPECTED_POPULARITY = 100; // TMDB popularity is unbounded; clamp above this

function weightedRating(voteAverage = 0, voteCount = 0) {
  const v = voteCount;
  const R = voteAverage;
  const m = MIN_VOTES_THRESHOLD;
  const C = GLOBAL_AVERAGE_RATING;
  return (v / (v + m)) * R + (m / (v + m)) * C;
}

function normalizedPopularity(popularity = 0) {
  return Math.min(popularity, MAX_EXPECTED_POPULARITY) / MAX_EXPECTED_POPULARITY;
}

function computeMovieScore(movie) {
  const ratingScore = weightedRating(movie.vote_average, movie.vote_count); // 0-10
  const popularityScore = normalizedPopularity(movie.popularity) * 10; // scale to 0-10

  const score = ratingScore * RATING_WEIGHT + popularityScore * POPULARITY_WEIGHT;
  return Math.round(score * 100) / 100; // 2 decimal places
}

module.exports = { computeMovieScore };