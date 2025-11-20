const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export const addAccount = async (
  accessToken: string,
  refreshToken: string,
  user_id: string,
  name: string,
  institution: string,
  currency: string,
  kind: string,
) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const res = await fetch(`${BASE_URL}/finance/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-refresh-token": refreshToken,
    },
    body: JSON.stringify({
      user_id: user_id,
      name: name,
      institution: institution,
      currency: currency,
      kind: kind,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch accounts");
  }

  const text = await res.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn("Failed to parse addAccount response", error);
    return null;
  }
};
