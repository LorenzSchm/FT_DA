import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export const generateToken = async (
  accessToken: string,
  refreshToken: string,
  code: string,
  name: string,
) => {
  if (!accessToken || !refreshToken || !code) {
    throw new Error("Missing access token, refresh token or code");
  }
  const resp = await axios.post(
    `${BASE_URL}/bank/generate-token`,
    { code, name },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-refresh-token": refreshToken,
      },
    },
  );
  return resp.data;
};

export const getData = async (accessToken: string, refreshToken: string) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }
  const resp = await axios.get(`${BASE_URL}/bank/data`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-refresh-token": refreshToken,
    },
  });
  return resp.data;
};
