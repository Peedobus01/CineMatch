const tmdbService = require("./tmdbService");
const Rating = require("../models/Rating");
const User = require("../models/User");
const cache = require("../utils/cache");
const { computeMovieScore } = require("../utils/scoring");

const HALF_LIFE_DAYS = 60;
const MIN_RATINGS_FOR_PERSONALIZATION = 3;
const MAX_CANDIDATES = 30;
const RATING_HISTORY_LIMIT = 200;
const CANDIDATE_CACHE_TTL = 10 * 60 * 1000;

function recencyWeight(ratedAt) {
  const ageDays = (Date.now() - new Date(ratedAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

function mergeScored(list, key, entry, delta) {
  const existing = list.find((item) => item[key] === entry[key]);
  if (existing) {
    existing.score += delta;
  } else if (delta > 0) {
    list.push({ ...entry, score: delta });
  }
  return list;
}

async function buildRecencyWeightedProfile(userId) {
  const ratings = await Rating.find({ user: userId }).sort({ updatedAt: -1 }).limit(RATING_HISTORY_LIMIT);

  let genres = [];
  let directors = [];
  let actors = [];
  const liked = [];
  const disliked = [];
  const ratedIds = new Set();

  for (const r of ratings) {
    ratedIds.add(r.tmdbId);
    const details = await tmdbService.getMovieDetails(r.tmdbId);

    const weight = recencyWeight(r.updatedAt) * (r.rating - 3);

    (details.genres || []).forEach((g) => {
      genres = mergeScored(genres, "genreId", { genreId: g.id, genreName: g.name }, weight);
    });

    const director = details.credits?.crew?.find((c) => c.job === "Director");
    if (director) {
      directors = mergeScored(directors, "personId", { personId: director.id, name: director.name }, weight);
    }

    (details.credits?.cast || []).slice(0, 3).forEach((actor) => {
      actors = mergeScored(actors, "personId", { personId: actor.id, name: actor.name }, weight);
    });

    if (r.rating >= 4) liked.push({ tmdbId: r.tmdbId, title: details.title });
    if (r.rating <= 2) disliked.push({ tmdbId: r.tmdbId, title: details.title });
  }

  const topN = (list, n) =>
    list
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

  return {
    topGenres: topN(genres, 5),
    topDirectors: topN(directors, 3),
    topActors: topN(actors, 3),
    liked: liked.slice(0, 10),
    disliked: disliked.slice(0, 10),
    ratedIds,
  };
}

async function buildColdStartCandidates() {
  const [trending, topRated] = await Promise.all([tmdbService.getTrending(), tmdbService.getTopRated()]);

  const seen = new Set();
  const deduped = [...trending, ...topRated].filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));

  return deduped
    .map((m) => ({ ...m, matchScore: computeMovieScore(m) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_CANDIDATES);
}

async function buildPersonalizedCandidates(profile) {
  const genreIds = profile.topGenres.slice(0, 2).map((g) => g.genreId);
  const actorIds = profile.topActors.slice(0, 2).map((a) => a.personId);

  const pools = [];
  if (genreIds.length) {
    const result = await tmdbService.discoverMovies({ genreIds }, 1);
    pools.push(result.results || []);
  }
  if (actorIds.length) {
    const result = await tmdbService.discoverMovies({ actorIds }, 1);
    pools.push(result.results || []);
  }
  for (const director of profile.topDirectors.slice(0, 2)) {
    const films = await tmdbService.getDirectorFilmography(director.personId);
    pools.push(films);
  }
  if (pools.flat().length === 0) {
    pools.push(await tmdbService.getPopular());
  }

  const seen = new Set();
  const deduped = pools.flat().filter((m) => {
    if (profile.ratedIds.has(m.id)) return false;
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  const scored = deduped.map((movie) => {
    const genreBonus = (movie.genre_ids || []).reduce((sum, gid) => {
      const match = profile.topGenres.find((g) => g.genreId === gid);
      return match ? sum + match.score * 0.3 : sum;
    }, 0);

    return { ...movie, matchScore: computeMovieScore(movie) + genreBonus };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, MAX_CANDIDATES);
}

async function getCandidatesForUser(userId) {
  return cache.getOrSet(`recCandidates:${userId}`, CANDIDATE_CACHE_TTL, async () => {
    const user = await User.findById(userId);
    const totalRatings = user.preferences.totalRatingsGiven;

    if (totalRatings < MIN_RATINGS_FOR_PERSONALIZATION) {
      const candidates = await buildColdStartCandidates();
      return { candidates, isColdStart: true, profile: null };
    }

    const profile = await buildRecencyWeightedProfile(userId);
    const candidates = await buildPersonalizedCandidates(profile);
    return { candidates, isColdStart: false, profile };
  });
}

function mergeCandidatePools(baseCandidates, referenceMovies) {
  const REFERENCE_PRIORITY_OFFSET = 100;
  const MIN_VOTE_COUNT = 300;
  const MIN_RATING = 6.0;

  const qualityFiltered = referenceMovies.filter(
    (m) => m.vote_count >= MIN_VOTE_COUNT && m.vote_average >= MIN_RATING
  );
  const referencePool = qualityFiltered.length >= 5 ? qualityFiltered : referenceMovies;

  const seen = new Set();
  const prioritized = referencePool
    .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
    .map((m) => ({ ...m, matchScore: computeMovieScore(m) + REFERENCE_PRIORITY_OFFSET, isReferenceMatch: true }));

  const filler = baseCandidates.filter((m) => !seen.has(m.id));

  return [...prioritized, ...filler]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_CANDIDATES);
}

module.exports = {
  getCandidatesForUser,
  mergeCandidatePools,
  buildGenericCandidates: buildColdStartCandidates,
};
