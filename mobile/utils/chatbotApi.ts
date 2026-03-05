/**
 * chatbotApi.ts
 *
 * Bridge between the chatbot parser and the existing CRUD API utilities.
 * Executes parsed commands against the app's real backend.
 */

import {
  ParsedCommand,
  formatCurrency,
  formatTransactionList,
} from "./chatbotParser";
import {
  getAccounts,
  getTransactions,
  addTransaction,
} from "./db/finance/finance";
import { getSubscriptions } from "./db/finance/subscriptions/subscriptions";
import { invalidateCache } from "./db/cache";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ───────────────────────────────────────────────────────────

type Session = {
  access_token: string;
  refresh_token: string;
};

export type ChatbotResult = {
  success: boolean;
  message: string;
  data?: any;
};

// ─── Helpers ─────────────────────────────────────────────────────────

async function authedFetch(
  url: string,
  session: Session,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "x-refresh-token": session.refresh_token,
      ...(options.headers || {}),
    },
  });
}

// ─── Handlers ────────────────────────────────────────────────────────

async function handleCreate(
  cmd: ParsedCommand,
  session: Session,
  accountId?: number,
): Promise<ChatbotResult> {
  if (!accountId) {
    return {
      success: false,
      message:
        "I need an account to add this to. Please select an account on your dashboard first.",
    };
  }

  if (!cmd.amount || !cmd.amountMinor) {
    return {
      success: false,
      message:
        'I couldn\'t detect an amount. Try something like: "add expense 45 groceries"',
    };
  }

  const type = cmd.type || "expense";
  const amountMinor =
    type === "expense" ? -Math.abs(cmd.amountMinor) : Math.abs(cmd.amountMinor);

  const data = {
    type: type === "expense" ? "EXPENSE" : "INCOME",
    amount_minor: String(Math.abs(cmd.amountMinor)),
    currency: cmd.currency || "EUR",
    description: cmd.description || cmd.category || type,
    merchant: cmd.category || cmd.description || type,
    date: cmd.date || new Date().toISOString().split("T")[0],
  };

  try {
    const result = await addTransaction(
      session.access_token,
      session.refresh_token,
      data,
      accountId,
    );
    const displayAmount = formatCurrency(
      Math.abs(cmd.amountMinor),
      cmd.currency,
    );
    return {
      success: true,
      message: `✅ Added ${type} of ${displayAmount}${cmd.category ? ` for "${cmd.category}"` : ""}.`,
      data: result,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to add transaction: ${err?.message || "Unknown error"}`,
    };
  }
}

async function handleRead(
  cmd: ParsedCommand,
  session: Session,
  accountId?: number,
): Promise<ChatbotResult> {
  // Balance query
  if (cmd.entity === "balance" || cmd.raw.toLowerCase().includes("balance")) {
    try {
      const accountsData = await getAccounts(
        session.access_token,
        session.refresh_token,
      );
      const accounts = accountsData.rows || accountsData;
      if (!accounts || accounts.length === 0) {
        return { success: true, message: "You don't have any accounts yet." };
      }

      const lines = accounts.map((acc: any) => {
        const bal = acc.balance_minor !== undefined ? acc.balance_minor : 0;
        const cur = acc.currency || "EUR";
        return `• ${acc.name}: ${formatCurrency(bal, cur)}`;
      });
      return {
        success: true,
        message: `📊 Your account balances:\n\n${lines.join("\n")}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to fetch accounts: ${err?.message}`,
      };
    }
  }

  // Subscription query
  if (cmd.entity === "subscription") {
    if (!accountId) {
      return {
        success: false,
        message: "Please select an account first to view subscriptions.",
      };
    }
    try {
      const subsData = await getSubscriptions(
        session.access_token,
        session.refresh_token,
        accountId,
      );
      const subs = (subsData.rows || subsData) as any[];
      if (!subs || subs.length === 0) {
        return {
          success: true,
          message: "No subscriptions found for this account.",
        };
      }
      const lines = subs.map((s: any) => {
        const active = s.active ? "🟢" : "🔴";
        return `${active} ${s.merchant || s.name}: ${formatCurrency(s.amount_minor || 0, s.currency || "EUR")}`;
      });
      return {
        success: true,
        message: `📋 Subscriptions:\n\n${lines.join("\n")}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to fetch subscriptions: ${err?.message}`,
      };
    }
  }

  // Default: transactions
  if (!accountId) {
    return {
      success: false,
      message: "Please select an account first to view transactions.",
    };
  }

  try {
    const txData = await getTransactions(
      session.access_token,
      session.refresh_token,
      accountId,
    );
    const transactions = (txData.rows || txData) as any[];

    // Normalize
    const normalized = transactions.map((t: any) => ({
      ...t,
      amount_minor: t.amount_minor !== undefined ? Number(t.amount_minor) : 0,
      description: t.description || t.merchant || "Transaction",
      category_id: t.category || t.category_id || "",
      currency: t.currency || "EUR",
      date: t.date || t.created_at || "",
    }));

    // Filter by category if provided
    let filtered = normalized;
    if (cmd.category) {
      const cat = cmd.category.toLowerCase();
      filtered = normalized.filter(
        (t: any) =>
          (t.category_id || "").toLowerCase().includes(cat) ||
          (t.description || "").toLowerCase().includes(cat),
      );
    }

    const formatted = formatTransactionList(filtered);
    return {
      success: true,
      message: `📋 Transactions (${filtered.length}):\n\n${formatted}`,
      data: filtered,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to fetch transactions: ${err?.message}`,
    };
  }
}

async function handleUpdate(
  cmd: ParsedCommand,
  session: Session,
  accountId?: number,
): Promise<ChatbotResult> {
  if (!cmd.id) {
    return {
      success: false,
      message:
        'I need a transaction ID to update. Try: "update transaction id 42 amount to 50"',
    };
  }

  if (!accountId) {
    return { success: false, message: "Please select an account first." };
  }

  const updateData: any = {};
  if (cmd.amountMinor) updateData.amount_minor = String(cmd.amountMinor);
  if (cmd.category) updateData.description = cmd.category;
  if (cmd.date) updateData.date = cmd.date;

  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      message:
        'I couldn\'t determine what to update. Try: "change transaction 42 amount to 50"',
    };
  }

  try {
    const res = await authedFetch(
      `${BASE_URL}/finance/transactions/${accountId}/${cmd.id}`,
      session,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Update failed");
    }

    invalidateCache(`/finance/transactions/${accountId}`);
    return {
      success: true,
      message: `✅ Transaction #${cmd.id} updated successfully.`,
    };
  } catch (err: any) {
    return { success: false, message: `Failed to update: ${err?.message}` };
  }
}

async function handleDelete(
  cmd: ParsedCommand,
  session: Session,
  accountId?: number,
): Promise<ChatbotResult> {
  if (!cmd.id) {
    return {
      success: false,
      message:
        'I need a transaction ID to delete. Try: "delete transaction 67"',
    };
  }

  if (!accountId) {
    return { success: false, message: "Please select an account first." };
  }

  try {
    const res = await authedFetch(
      `${BASE_URL}/finance/transactions/${accountId}/${cmd.id}`,
      session,
      { method: "DELETE" },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Delete failed");
    }

    invalidateCache(`/finance/transactions/${accountId}`);
    return {
      success: true,
      message: `✅ Transaction #${cmd.id} has been deleted.`,
    };
  } catch (err: any) {
    return { success: false, message: `Failed to delete: ${err?.message}` };
  }
}

// ─── Main executor ───────────────────────────────────────────────────

export async function executeCommand(
  cmd: ParsedCommand,
  session: Session,
  accountId?: number,
): Promise<ChatbotResult> {
  switch (cmd.intent) {
    case "CREATE":
      return handleCreate(cmd, session, accountId);
    case "READ":
      return handleRead(cmd, session, accountId);
    case "UPDATE":
      return handleUpdate(cmd, session, accountId);
    case "DELETE":
      return handleDelete(cmd, session, accountId);
    default:
      return {
        success: false,
        message:
          "I didn't quite understand that. Here's what I can help with:\n\n" +
          '• Add expenses/income: "add expense 45 groceries"\n' +
          '• View transactions: "show my transactions"\n' +
          '• Check balance: "what is my balance"\n' +
          '• Update: "change transaction 42 amount to 50"\n' +
          '• Delete: "delete transaction 67"',
      };
  }
}
