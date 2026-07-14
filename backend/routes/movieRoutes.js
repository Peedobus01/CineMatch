const express = require("express");
const router = express.Router();
const {
  getTrending,
  getPopular,
  getMostPopular,
  getTopRated,
  getNowPlaying,
  getGenres,
  getMovieDetails,
  searchPerson,
} = require("../controllers/movieController");

router.get("/trending", getTrending);
router.get("/popular", getPopular);
router.get("/most-popular", getMostPopular);
router.get("/top-rated", getTopRated);
router.get("/now-playing", getNowPlaying);
router.get("/genres", getGenres);
router.get("/people/search", searchPerson);

router.get("/:tmdbId", getMovieDetails);

module.exports = router;