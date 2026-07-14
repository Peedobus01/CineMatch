const axios = require("axios");

const tmdbClient = axios.create({
  baseURL: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
  timeout: 15000,
});

tmdbClient.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    api_key: process.env.TMDB_API_KEY,
  };
  return config;
});

tmdbClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkError = !error.response;
    if (isNetworkError && config && !config._retried) {
      config._retried = true;
      await new Promise((resolve) => setTimeout(resolve, 400));
      return tmdbClient(config);
    }
    return Promise.reject(error);
  }
);

module.exports = tmdbClient;