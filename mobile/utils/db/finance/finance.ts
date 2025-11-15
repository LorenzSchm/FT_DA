const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export const getAccounts = async (accessToken, refreshToken) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const res = await fetch(`${BASE_URL}/finance/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-refresh-token": refreshToken,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch accounts");
  }

  return res.json();
};

export const getTransactions = async (accessToken, refreshToken, account_id) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const res = await fetch(`${BASE_URL}/finance/transactions/${account_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-refresh-token": refreshToken,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch transactions");
  }

  return res.json();
};


export const addTransaction = async (accessToken, refreshToken, data, account_id) => {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  // Convert BigInt to string before JSON serialization
  const serializedData = {
    ...data,
    amount_minor: typeof data.amount_minor === "bigint"
      ? data.amount_minor.toString()
      : String(data.amount_minor),
  };

  const res = await fetch(`${BASE_URL}/finance/transactions/${account_id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-refresh-token": refreshToken,
    },
    body: JSON.stringify(serializedData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to add transaction");
  }

  return res.json();
};