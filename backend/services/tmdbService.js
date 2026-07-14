const tmdb = require("../config/tmdb");
const cache = require("../utils/cache");

const CACHE_TTL = {
  HOMEPAGE_SECTIONS: 15 * 60 * 1000, // 15 min - trending/popular/top-rated change slowly
  GENRE_LIST: 24 * 60 * 60 * 1000, // 24 hr - genre list basically never changes
  MOVIE_DETAILS: 6 * 60 * 60 * 1000, // 6 hr - a movie's own metadata almost never changes
};

// --- Homepage sections (cached, since every logged-in user hits these) ---

const getTrending = async () => {
  return cache.getOrSet("tmdb:trending", CACHE_TTL.HOMEPAGE_SECTIONS, async () => {
    const { data } = await tmdb.get("/trending/movie/week");
    return data.results;
  });
};

const getPopular = async (page = 1) => {
  return cache.getOrSet(`tmdb:popular:${page}`, CACHE_TTL.HOMEPAGE_SECTIONS, async () => {
    const { data } = await tmdb.get("/movie/popular", { params: { page } });
    return data.results;
  });
};

const getTopRated = async (page = 1) => {
  return cache.getOrSet(`tmdb:top_rated:${page}`, CACHE_TTL.HOMEPAGE_SECTIONS, async () => {
    const { data } = await tmdb.get("/movie/top_rated", { params: { page } });
    return data.results;
  });
};

const getNowPlaying = async (page = 1) => {
  return cache.getOrSet(`tmdb:now_playing:${page}`, CACHE_TTL.HOMEPAGE_SECTIONS, async () => {
    const { data } = await tmdb.get("/movie/now_playing", { params: { page } });
    return data.results;
  });
};

const getMostPopular = async (page = 1) => {
  return cache.getOrSet(`tmdb:most_popular:${page}`, CACHE_TTL.HOMEPAGE_SECTIONS, async () => {
    const { data } = await tmdb.get("/discover/movie", {
      params: { sort_by: "vote_count.desc", page },
    });
    return data.results;
  });
};

const getGenreList = async () => {
  return cache.getOrSet("tmdb:genres", CACHE_TTL.GENRE_LIST, async () => {
    const { data } = await tmdb.get("/genre/movie/list");
    return data.genres; // [{ id, name }]
  });
};

// --- Movie details (used on the Movie Details page + internally for ranking) ---

const getMovieDetails = async (tmdbId) => {
  return cache.getOrSet(`tmdb:movie:${tmdbId}`, CACHE_TTL.MOVIE_DETAILS, async () => {
    const { data } = await tmdb.get(`/movie/${tmdbId}`, {
      params: { append_to_response: "credits" },
    });
    return data;
  });
};

// --- Person lookups (for director / actor filters) ---

const searchPerson = async (name) => {
  const { data } = await tmdb.get("/search/person", { params: { query: name } });
  return data.results; // [{ id, name, profile_path, known_for }]
};

// Returns the full movie objects (title, genre_ids, vote_average, popularity,
// release_date, etc - everything TMDB's credits response already includes)
// for every movie a given person directed. Used because TMDB's
// /discover/movie has no native "director" filter, so we filter/rank this
// filmography ourselves instead. One API call covers the whole filmography.
const getDirectorFilmography = async (personId) => {
  const { data } = await tmdb.get(`/person/${personId}/movie_credits`);
  return (data.crew || []).filter((credit) => credit.job === "Director");
};

// --- Discovery / filtered search ---
// Maps our own filter object to TMDB's discover params wherever TMDB supports
// it directly. Director filtering is NOT done here — it's handled one level
// up in the discovery service by intersecting with getDirectorFilmography,
// since TMDB has no native discover param for it.
const discoverMovies = async (filters = {}, page = 1) => {
  const params = { page, sort_by: "popularity.desc" };

  if (filters.genreIds?.length) {
    params.with_genres = filters.genreIds.slice(0, 2).join(","); // max 2 genres, enforced here too
  }
  if (filters.actorIds?.length) {
    params.with_cast = filters.actorIds.join(",");
  }
  if (filters.minRating) {
    params["vote_average.gte"] = filters.minRating;
  }
  if (filters.yearFrom) {
    params["primary_release_date.gte"] = `${filters.yearFrom}-01-01`;
  }
  if (filters.yearTo) {
    params["primary_release_date.lte"] = `${filters.yearTo}-12-31`;
  }
  if (filters.runtimeMin) {
    params["with_runtime.gte"] = filters.runtimeMin;
  }
  if (filters.runtimeMax) {
    params["with_runtime.lte"] = filters.runtimeMax;
  }
  if (filters.language) {
    params.with_original_language = filters.language;
  }

  const { data } = await tmdb.get("/discover/movie", { params });
  return data; // { page, results, total_pages, total_results }
};

const searchMoviesByTitle = async (title, page = 1) => {
  const { data } = await tmdb.get("/search/movie", { params: { query: title, page } });
  return data;
};

const getSimilarMovies = async (tmdbId) => {
  const { data } = await tmdb.get(`/movie/${tmdbId}/similar`);
  return data.results || [];
};

const getRecommendedMovies = async (tmdbId) => {
  const { data } = await tmdb.get(`/movie/${tmdbId}/recommendations`);
  return data.results || [];
};

module.exports = {
  getTrending,
  getPopular,
  getMostPopular,
  getTopRated,
  getNowPlaying,
  getGenreList,
  getMovieDetails,
  searchPerson,
  getDirectorFilmography,
  discoverMovies,
  searchMoviesByTitle,
  getSimilarMovies,
  getRecommendedMovies,
};