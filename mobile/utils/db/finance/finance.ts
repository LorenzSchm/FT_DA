const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export const getAccounts = async (accessToken, refreshToken) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const res = await fetch(`${BASE_URL}/finance/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "x-refresh-token": refreshToken,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch accounts");
  }
  const data = await res.json();
  console.log(data);
  return data.rows;
};

