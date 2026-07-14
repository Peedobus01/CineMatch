import api from "./api";

const getRecommendations = async () => {
  const { data } = await api.get("/recommendations");
  return data.data;
};

const getRecommendationsForQuery = async (query) => {
  const { data } = await api.post("/recommendations/query", { query });
  return data.data;
};

export default { getRecommendations, getRecommendationsForQuery };