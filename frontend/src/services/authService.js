import api from "./api";

const register = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data.data; // { _id, name, email, token, ... }
};

const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data.data;
};

const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data.data;
};

export default { register, login, getMe };
