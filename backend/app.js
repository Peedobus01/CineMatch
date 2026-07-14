const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const discoveryRoutes = require("./routes/discoveryRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const recentlyViewedRoutes = require("./routes/recentlyViewedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CineMatch API is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/discover", discoveryRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/recently-viewed", recentlyViewedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/recommendations", recommendationRoutes);
// Additional routes (discovery/search, ratings, watchlist, recommendations, profile)
// will be mounted here in later phases.

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
