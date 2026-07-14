const axios = require("axios");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
// const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

async function generateStructuredContent({ prompt, schema, temperature = 0.4 }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const url = `${BASE_URL}/models/${GEMINI_MODEL}:generateContent`;

  let response;
  try {
    response = await axios.post(
      url,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature,
          thinkingConfig: { thinkingBudget: 0 },
        },
      },
      {
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
  } catch (err) {
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    throw new Error(`Gemini request failed: ${detail}`);
  }

  const data = response.data;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini returned no usable content: ${JSON.stringify(data)}`);
  }

  return JSON.parse(text);
}

module.exports = { generateStructuredContent };