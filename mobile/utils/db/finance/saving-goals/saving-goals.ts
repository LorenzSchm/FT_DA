import axios from "axios";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

const normalizeGoal = (g: any) => {
  const contributed_minor =
    g.contributed_minor ??
    g.contributedMinor ??
    g.current_minor ??
    (typeof g.currentAmount === "number" ? Math.round(g.currentAmount * 100) : undefined) ??
    (typeof g.current_amount === "number" ? Math.round(g.current_amount * 100) : undefined) ??
    0;

  const target_minor =
    g.target_minor ??
    g.targetMinor ??
    g.goal_minor ??
    (typeof g.targetAmount === "number" ? Math.round(g.targetAmount * 100) : undefined) ??
    (typeof g.target_amount === "number" ? Math.round(g.target_amount * 100) : undefined) ??
    0;

  // Normalize currency to a symbol if possible
  let currency = g.currency ?? g.currency_code ?? g.currencySymbol ?? "EUR";
  if (currency === "EUR" || currency === "EUR ") currency = "€";

  return {
    ...g,
    id: g.id ?? g.goal_id ?? g.goalId ?? null,
    name: g.name ?? g.label ?? g.title ?? "",
    contributed_minor,
    target_minor,
    currency,
  };
};

export const fetchSavingsAccounts = async (session: any) => {
  if (!session?.access_token) return;

  const url = `${API_URL}/finance/saving-goals/`;
  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    "x-refresh-token": session.refresh_token,
  };

  try {
    const response = await axios.get(url, {
      headers,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept status codes from 200 to 399
      },
    });

    if (response.data && response.data.goals) {
      // normalize each goal before returning
      return response.data.goals.map((g: any) => normalizeGoal(g));
    }
  } catch (error) {
    console.error("Error fetching savings accounts:", error);
  }
};

export const handleAddAccount = async (name: string, initialAmount: string, session: any) => {
  if (!session?.access_token) {
    console.error("No access token available");
    return;
  }

  const url = `${API_URL}/finance/saving-goals/`;
  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    "x-refresh-token": session.refresh_token,
    "Content-Type": "application/json",
  };

  try {
    const cleanAmount = (initialAmount || "").replace(/[€,\s]/g, "");
    const amountInCents = Math.round(parseFloat(cleanAmount) * 100) || 0;

    const newAccount = {
      name: name.trim(),
      goalAmount: 0,
      currentAmount: amountInCents,
      currency: "EUR",
      provider: "FT",
    };

    // Try to include the contributed amount in the create request so the server records it
    const createBody: any = {
      name: newAccount.name,
      target_minor: 0,
      currency: newAccount.currency,
    };

    // include contributed_minor if we have a positive initial amount
    if (amountInCents > 0) {
      createBody.contributed_minor = amountInCents;
      // also include current_minor and current_amount as alternatives some APIs expect
      createBody.current_minor = amountInCents;
      createBody.current_amount = (amountInCents / 100).toFixed(2);
    }

    const response = await axios.post(url, createBody, {
      headers,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept status codes from 200 to 399
      },
    });

    if (response.data) {
      // Fetch updated accounts list and return normalized goals
      const accountsResponse = await axios.get(url, {
        headers,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept status codes from 200 to 399
        },
      });

      if (accountsResponse.data && accountsResponse.data.goals) {
        const normalized = accountsResponse.data.goals.map((g: any) => normalizeGoal(g));

        // If server didn't persist the initial amount, patch the created goal locally
        // Prefer matching by returned created id from response.data, otherwise fallback to name matching
        const createdId = response.data?.id ?? response.data?.goal_id ?? response.data?.goalId ?? null;
        if (amountInCents > 0) {
          if (createdId) {
            const idx = normalized.findIndex((ng: any) => ng.id === createdId);
            if (idx !== -1) {
              normalized[idx].contributed_minor = amountInCents;
            }
          } else {
            // fallback: find first account with same name and contributed_minor === 0 and set it
            const idx = normalized.findIndex((ng: any) => ng.name === newAccount.name && (ng.contributed_minor ?? 0) === 0);
            if (idx !== -1) {
              normalized[idx].contributed_minor = amountInCents;
            }
          }
        }

        return normalized;
      }

      // Fallback: if server returned a single created object, normalize it and set contributed_minor
    }

    return null;
  } catch (error) {
    console.error("Error adding account:", error);
    throw error;
  }
};

export const handleAddTransaction = async (
  savingId: number,
  type: "add" | "subtract",
  name: string,
  amount: string,
  session: any
) => {
  if (!session?.access_token) {
    console.error("No access token available");
    return;
  }

  const url = `${API_URL}/finance/saving-goals/contributions/`;
  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    "x-refresh-token": session.refresh_token,
    "Content-Type": "application/json",
  };

  try {
    const amountInCents =
      Math.round(parseFloat((amount || "").replace(/[€,\s]/g, "")) * 100) || 0;

    const requestBody = {
      goal_id: savingId.toString(),
      contributed_minor: type === "add" ? amountInCents : -amountInCents,
    };

    const response = await axios.post(url, requestBody, {
      headers,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept status codes from 200 to 399
      },
    });

    if (response.data) {
      console.log("Transaction added successfully:", response.data);

      const accountsUrl = `${API_URL}/finance/saving-goals/`;

      const accountsResponse = await axios.get(accountsUrl, {
        headers,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept status codes from 200 to 399
        },
      });

      if (accountsResponse.data && accountsResponse.data.goals) {
        return {
          transaction: response.data,
          accounts: accountsResponse.data.goals.map((g: any) => normalizeGoal(g)),
        };
      }

      return { transaction: response.data };
    }

    return null;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};
