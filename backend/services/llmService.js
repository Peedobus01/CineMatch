const gemini = require("../config/gemini");

const RECOMMENDATION_SCHEMA = {
  type: "OBJECT",
  properties: {
    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          tmdbId: { type: "INTEGER" },
          reason: { type: "STRING" },
        },
        required: ["tmdbId", "reason"],
      },
    },
  },
  required: ["recommendations"],
};

// function buildPrompt({ candidates, profile, isColdStart, nlQuery }) {
//   const candidateLines = candidates
//     .map((c) => {
//       const tag = c.isReferenceMatch ? " [SIMILAR TO REQUESTED MOVIE]" : "";
//       return `- id:${c.id} | "${c.title}" | rating:${c.vote_average} | genre_ids:${(c.genre_ids || []).join(",")}${tag}`;
//     })
//     .join("\n");

//   const profileLines = isColdStart
//     ? "This is a new user with little or no rating history yet - recommend broadly appealing, high-quality picks from the candidates."
//     : `Favourite genres: ${profile.topGenres.map((g) => g.genreName).join(", ") || "none yet"}
// Favourite directors: ${profile.topDirectors.map((d) => d.name).join(", ") || "none yet"}
// Favourite actors: ${profile.topActors.map((a) => a.name).join(", ") || "none yet"}
// Movies they rated highly: ${profile.liked.map((m) => m.title).join(", ") || "none yet"}
// Movies they rated poorly: ${profile.disliked.map((m) => m.title).join(", ") || "none yet"}`;

//   const queryLine = nlQuery
//     ? `The user is specifically asking: "${nlQuery}" - prioritize matching this request over general taste. Candidates tagged [SIMILAR TO REQUESTED MOVIE] were pulled specifically because they resemble the movie the user named - strongly prefer these over movies that only match the user's general historical taste. Among those tagged candidates, favor the ones that are critically well-regarded, directed by acclaimed filmmakers, or known for strong writing/score/craft, and that most closely match the emotional tone and complexity level described in the request - not just shared genre.`
//     : "No specific request right now - give well-matched personalized picks based on their profile.";


function buildPrompt({ candidates, profile, isColdStart, nlQuery }) {
  const candidateLines = candidates
    .map((c) => {
      const tag = c.isReferenceMatch ? " [SIMILAR TO REQUESTED MOVIE]" : "";
      return `- id:${c.id} | "${c.title}" | rating:${c.vote_average} | genre_ids:${(c.genre_ids || []).join(",")}${tag}`;
    })
    .join("\n");

  let profileLines;
  if (nlQuery) {
    profileLines =
      "No user profile is being used for this request, by design - the user asked for something specific, so judge candidates purely on their own merits (genre, tone, cast, critical reception) and how well they match the request below, not on any assumed personal taste.";
  } else if (isColdStart) {
    profileLines =
      "This is a new user with little or no rating history yet - recommend broadly appealing, high-quality picks from the candidates.";
  } else {
    profileLines = `Favourite genres: ${profile.topGenres.map((g) => g.genreName).join(", ") || "none yet"}
Favourite directors: ${profile.topDirectors.map((d) => d.name).join(", ") || "none yet"}
Favourite actors: ${profile.topActors.map((a) => a.name).join(", ") || "none yet"}
Movies they rated highly: ${profile.liked.map((m) => m.title).join(", ") || "none yet"}
Movies they rated poorly: ${profile.disliked.map((m) => m.title).join(", ") || "none yet"}`;
  }

  const queryLine = nlQuery
    ? `The user is specifically asking: "${nlQuery}". Candidates tagged [SIMILAR TO REQUESTED MOVIE] were pulled specifically because they resemble the movie the user named - strongly prefer these when present. Among all candidates, favor the ones that are critically well-regarded, directed by acclaimed filmmakers, or known for strong writing/score/craft, and that most closely match the emotional tone and complexity level described in the request - not just shared genre.`
    : "No specific request right now - give well-matched personalized picks based on their profile.";
    
  return `You are the recommendation assistant for CineMatch, a movie discovery platform.

STRICT RULE: You must choose ONLY from the CANDIDATE MOVIES list below, referencing each by its exact id. Never invent, assume, or suggest any movie that is not in this list, even if you believe a better match exists elsewhere.

USER PROFILE:
${profileLines}

REQUEST:
${queryLine}

CANDIDATE MOVIES:
${candidateLines}

Pick the 5 to 8 best-matching movies from the candidate list above for this user and this request. For each pick, write a short reason (under 20 words) explaining specifically why it fits this user - reference their taste or the request directly rather than a generic description of the movie.`;
}

async function getRecommendationsFromLLM({ candidates, profile, isColdStart, nlQuery = null }) {
  try {
    const prompt = buildPrompt({ candidates, profile, isColdStart, nlQuery });
    const result = await gemini.generateStructuredContent({ prompt, schema: RECOMMENDATION_SCHEMA });

    const candidateIds = new Set(candidates.map((c) => c.id));
    const validated = (result.recommendations || []).filter((r) => candidateIds.has(r.tmdbId));

    if (validated.length === 0) return null;

    const candidateById = Object.fromEntries(candidates.map((c) => [c.id, c]));
    return validated.map((r) => ({ ...candidateById[r.tmdbId], reason: r.reason, source: "llm" }));
  } catch (err) {
    console.error("LLM recommendation call failed, falling back to deterministic ranking:", err.message);
    return null;
  }
}

module.exports = { getRecommendationsFromLLM };