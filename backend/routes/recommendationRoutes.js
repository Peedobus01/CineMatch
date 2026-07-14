const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  getRecommendationsForQuery,
} = require("../controllers/recommendationController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/", getRecommendations);
router.post("/query", getRecommendationsForQuery);

module.exports = router;