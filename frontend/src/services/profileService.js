import api from "./api";

const getMyProfile = async () => {
  const { data } = await api.get("/profile/me");
  return data.data;
};

export default { getMyProfile };