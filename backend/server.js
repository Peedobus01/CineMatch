require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening.
// If the DB connection fails, connectDB() exits the process (see config/db.js).
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`CineMatch backend running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
});

// Safety net for unhandled promise rejections (e.g. a stray TMDB call that isn't awaited properly)
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
