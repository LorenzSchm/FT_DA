const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
export const addSubscription = async (
  accessToken,
  refreshToken,
  data,
  account_id
) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const serializedData = {
    ...data,
    amount_minor:
      typeof data.amount_minor === "bigint"
        ? data.amount_minor.toString()
        : String(data.amount_minor),

    // Ensure every_n is serialized properly
    every_n:
      typeof data.every_n === "bigint"
        ? data.every_n.toString()
        : String(data.every_n),
  };

  const res = await fetch(
    `${BASE_URL}/finance/subscriptions/${account_id}/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-refresh-token": refreshToken,
      },
      body: JSON.stringify(serializedData),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to add subscription");
  }

  return res.json();
};


export const getSubscriptions = async (
  accessToken,
  refreshToken,
  account_id
) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const res = await fetch(
    `${BASE_URL}/finance/subscriptions/${account_id}/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-refresh-token": refreshToken,
      },
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch subscriptions");
  }

  return res.json();
};
