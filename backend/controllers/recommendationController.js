const asyncHandler = require("express-async-handler");
const recommendationService = require("../services/recommendationService");
const llmService = require("../services/llmService");
const tmdbService = require("../services/tmdbService");

function extractReferenceTitle(query) {
  const lower = query.toLowerCase();
  const triggers = ["like ", "similar to ", "such as "];
  let idx = -1;
  let triggerLen = 0;
  for (const t of triggers) {
    const pos = lower.indexOf(t);
    if (pos !== -1 && (idx === -1 || pos < idx)) {
      idx = pos;
      triggerLen = t.length;
    }
  }
  if (idx === -1) return null;

  const rest = query.slice(idx + triggerLen);
  const match = rest.match(/^([A-Z][\w:'-]*(?:\s+[A-Z][\w:'-]*)*)/);
  return match ? match[1].trim() : null;
}

async function withRetry(fn, retries = 2, delayMs = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs);
  }
}

async function buildCandidatePool(userId, nlQuery) {
  if (!nlQuery) {
    const { candidates, isColdStart, profile } = await recommendationService.getCandidatesForUser(userId);
    return { candidates, isColdStart, profile, referenceMatchApplied: false, referenceTitle: null };
  }

  const genericCandidates = await recommendationService.buildGenericCandidates();

  const referenceTitle = extractReferenceTitle(nlQuery);
  if (!referenceTitle) {
    return {
      candidates: genericCandidates,
      isColdStart: false,
      profile: null,
      referenceMatchApplied: false,
      referenceTitle: null,
    };
  }

  try {
    const searchResult = await withRetry(() => tmdbService.searchMoviesByTitle(referenceTitle));

    const topCandidates = (searchResult.results || []).slice(0, 5);
    const topMatch = topCandidates.length
      ? topCandidates.reduce((best, m) => (m.vote_count > best.vote_count ? m : best))
      : null;

    if (!topMatch) {
      return {
        candidates: genericCandidates,
        isColdStart: false,
        profile: null,
        referenceMatchApplied: false,
        referenceTitle,
      };
    }

    const [similar, recommended] = await Promise.all([
      withRetry(() => tmdbService.getSimilarMovies(topMatch.id)),
      withRetry(() => tmdbService.getRecommendedMovies(topMatch.id)),
    ]);

    const enriched = recommendationService.mergeCandidatePools(genericCandidates, [...similar, ...recommended]);
    return { candidates: enriched, isColdStart: false, profile: null, referenceMatchApplied: true, referenceTitle };
  } catch (err) {
    console.error(
      `Reference-title enrichment failed for "${referenceTitle}", continuing without it:`,
      err.message
    );
    return {
      candidates: genericCandidates,
      isColdStart: false,
      profile: null,
      referenceMatchApplied: false,
      referenceTitle,
    };
  }
}

function deterministicReason(isColdStart, hasQuery) {
  if (hasQuery) return "Matches your search.";
  return isColdStart ? "Popular and highly rated right now." : "Matches your favourite genres and directors.";
}

const getRecommendations = asyncHandler(async (req, res) => {
  const { candidates, isColdStart, profile } = await buildCandidatePool(req.user._id, null);

  const llmResult = await llmService.getRecommendationsFromLLM({
    candidates,
    profile,
    isColdStart,
    nlQuery: null,
  });

  const recommendations =
    llmResult ||
    candidates
      .slice(0, 8)
      .map((c) => ({ ...c, reason: deterministicReason(isColdStart, false), source: "deterministic" }));

  res.json({ success: true, data: { recommendations, isColdStart, usedLLM: !!llmResult } });
});

const getRecommendationsForQuery = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    res.status(400);
    throw new Error("Please provide a search query");
  }

  const { candidates, isColdStart, profile, referenceMatchApplied, referenceTitle } = await buildCandidatePool(
    req.user._id,
    query
  );

  const llmResult = await llmService.getRecommendationsFromLLM({
    candidates,
    profile,
    isColdStart,
    nlQuery: query,
  });

  const recommendations =
    llmResult ||
    candidates.slice(0, 8).map((c) => ({ ...c, reason: deterministicReason(isColdStart, true), source: "deterministic" }));

  res.json({
    success: true,
    data: {
      recommendations,
      isColdStart,
      usedLLM: !!llmResult,
      referenceTitle,
      referenceMatchApplied,
    },
  });
});

module.exports = { getRecommendations, getRecommendationsForQuery };