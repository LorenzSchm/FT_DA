const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

type SubscriptionData = {
  merchant: string;
  amount_minor: number | bigint;
  currency: string;
  start_date: string;
  unit: string;
  every_n: number | bigint;
  active: boolean;
  auto_detected: boolean;
};

export const addSubscription = async (
  accessToken: string,
  refreshToken: string,
  data: SubscriptionData,
  account_id: number,
) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const url = `${BASE_URL}/finance/subscriptions/${account_id}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "x-refresh-token": refreshToken,
  };

  const serializedData = {
    ...data,
    amount_minor:
      typeof data.amount_minor === "bigint"
        ? data.amount_minor.toString()
        : String(data.amount_minor),

    every_n:
      typeof data.every_n === "bigint"
        ? data.every_n.toString()
        : String(data.every_n),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(serializedData),
      redirect: "follow",
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(responseData.detail || "Failed to add subscription");
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptions = async (
  accessToken: string,
  refreshToken: string,
  account_id: number,
) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const url = `${BASE_URL}/finance/subscriptions/${account_id}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "x-refresh-token": refreshToken,
  };

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      redirect: "follow",
    });

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(responseData.detail || "Failed to fetch subscriptions");
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};
