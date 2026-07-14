import api from "./api";

const getGenres = async () => {
  const { data } = await api.get("/movies/genres");
  return data.data;
};

const searchPerson = async (name) => {
  const { data } = await api.get("/movies/people/search", { params: { name } });
  return data.data;
};

const discoverMovies = async (filters, page = 1) => {
  const params = { page };

  if (filters.title) params.title = filters.title;
  if (filters.genreIds?.length) params.genreIds = filters.genreIds.join(",");
  if (filters.directorId) params.directorId = filters.directorId;
  if (filters.actorIds?.length) params.actorIds = filters.actorIds.join(",");
  if (filters.minRating) params.minRating = filters.minRating;
  if (filters.yearFrom) params.yearFrom = filters.yearFrom;
  if (filters.yearTo) params.yearTo = filters.yearTo;
  if (filters.runtimeMin) params.runtimeMin = filters.runtimeMin;
  if (filters.runtimeMax) params.runtimeMax = filters.runtimeMax;
  if (filters.language) params.language = filters.language;

  const { data } = await api.get("/discover", { params });
  return data.data;
};

const getMovieDetails = async (tmdbId) => {
  const { data } = await api.get(`/movies/${tmdbId}`);
  return data.data;
};

const getMyRatingForMovie = async (tmdbId) => {
  const { data } = await api.get(`/ratings/${tmdbId}/me`);
  return data.data; // null if not rated yet
};

const rateMovie = async (tmdbId, rating, review = "") => {
  const { data } = await api.post(`/ratings/${tmdbId}`, { rating, review });
  return data.data;
};

const checkWatchlist = async (tmdbId) => {
  const { data } = await api.get(`/watchlist/${tmdbId}/check`);
  return data.data.inWatchlist;
};

const addToWatchlist = async (tmdbId) => {
  const { data } = await api.post(`/watchlist/${tmdbId}`);
  return data.data;
};

const removeFromWatchlist = async (tmdbId) => {
  await api.delete(`/watchlist/${tmdbId}`);
};

const trackRecentlyViewed = async (tmdbId) => {
  await api.post(`/recently-viewed/${tmdbId}`);
};

const getTrending = async () => {
  const { data } = await api.get("/movies/trending");
  return data.data;
};

const getPopular = async () => {
  const { data } = await api.get("/movies/popular");
  return data.data;
};

const getTopRated = async () => {
  const { data } = await api.get("/movies/top-rated");
  return data.data;
};

const getNowPlaying = async () => {
  const { data } = await api.get("/movies/now-playing");
  return data.data;
};

const getWatchlist = async () => {
  const { data } = await api.get("/watchlist");
  return data.data;
};

const getMostPopular = async () => {
  const { data } = await api.get("/movies/most-popular");
  return data.data;
};

export default {
  getGenres,
  searchPerson,
  discoverMovies,
  getMovieDetails,
  getMyRatingForMovie,
  rateMovie,
  checkWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  trackRecentlyViewed,
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getWatchlist,
  getMostPopular,
};