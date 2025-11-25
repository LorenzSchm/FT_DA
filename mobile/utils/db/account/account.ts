import { json } from "node:stream/consumers";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export const addAccount = async (
  accessToken: string,
  refreshToken: string,
  user_id: string,
  name: string,
  institution: string,
  currency: string,
  kind: string,
  initial_amount: string,
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

  if (initial_amount) {
    console.log(res.text());
    await fetch(`${BASE_URL}/finance/transactions/${JSON.parse(text).id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-refresh-token": refreshToken,
      },
      body: JSON.stringify({
        type: "income",
        amount_minor: initial_amount,
        currency: "EUR",
        description: "Initial Deposit",
        merchant: "Account Creation",
      }),
    });
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn("Failed to parse addAccount response", error);
    return null;
  }
};
