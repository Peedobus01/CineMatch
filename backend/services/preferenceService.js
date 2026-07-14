const User = require("../models/User");
const tmdbService = require("./tmdbService");

const MAX_TRACKED_PER_CATEGORY = 12; // keeps the arrays bounded instead of growing forever

/**
 * Adds `delta` to the score of a genre/director/actor entry in a preference
 * array, creating the entry if it doesn't exist yet, then trims the array
 * back down to the top N by score.
 */
function applyDeltaToCategory(list, key, entry, delta) {
  const existing = list.find((item) => item[key] === entry[key]);
  if (existing) {
    existing.score += delta;
  } else if (delta > 0) {
    list.push({ ...entry, score: delta });
  }
  return list
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_TRACKED_PER_CATEGORY);
}

/**
 * Called whenever a rating is created, changed, or removed.
 * oldValue: the previous rating (null if this is a brand-new rating)
 * newValue: the new rating (null if the rating was deleted)
 *
 * This is delta-based rather than a full recalculation from rating history,
 * so it's O(1) work regardless of how many movies the user has rated.
 */
async function applyRatingChange(userId, tmdbId, oldValue, newValue) {
  const user = await User.findById(userId);
  if (!user) return;

  const delta = (newValue || 0) - (oldValue || 0);

  const details = await tmdbService.getMovieDetails(tmdbId);
  const director = details.credits?.crew?.find((c) => c.job === "Director");
  const topActors = (details.credits?.cast || []).slice(0, 3);

  (details.genres || []).forEach((g) => {
    user.preferences.favouriteGenres = applyDeltaToCategory(
      user.preferences.favouriteGenres,
      "genreId",
      { genreId: g.id, genreName: g.name },
      delta
    );
  });

  if (director) {
    user.preferences.favouriteDirectors = applyDeltaToCategory(
      user.preferences.favouriteDirectors,
      "personId",
      { personId: director.id, name: director.name },
      delta
    );
  }

  topActors.forEach((actor) => {
    user.preferences.favouriteActors = applyDeltaToCategory(
      user.preferences.favouriteActors,
      "personId",
      { personId: actor.id, name: actor.name },
      delta
    );
  });

  const totalBefore = user.preferences.totalRatingsGiven;
  const avgBefore = user.preferences.averageRatingGiven;

  if (oldValue === null && newValue !== null) {
    const newTotal = totalBefore + 1;
    user.preferences.averageRatingGiven = (avgBefore * totalBefore + newValue) / newTotal;
    user.preferences.totalRatingsGiven = newTotal;
  } else if (oldValue !== null && newValue === null) {
    const newTotal = Math.max(totalBefore - 1, 0);
    user.preferences.averageRatingGiven =
      newTotal === 0 ? 0 : (avgBefore * totalBefore - oldValue) / newTotal;
    user.preferences.totalRatingsGiven = newTotal;
  } else if (oldValue !== null && newValue !== null) {
    user.preferences.averageRatingGiven =
      totalBefore === 0 ? newValue : (avgBefore * totalBefore - oldValue + newValue) / totalBefore;
  }

  await user.save();
}

module.exports = { applyRatingChange };