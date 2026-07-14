const express = require("express");
const router = express.Router();
const { discover } = require("../controllers/discoveryController");

// GET /api/discover?title=&genreIds=28,12&directorId=525&actorIds=6193&minRating=7&yearFrom=2010&yearTo=2020&runtimeMin=90&runtimeMax=150&language=en&page=1
router.get("/", discover);

module.exports = router;