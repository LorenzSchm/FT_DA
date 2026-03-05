/**
 * chatbotAI.ts
 *
 * OpenAI-powered chatbot engine using function calling (tools).
 * The model decides which CRUD operation to run based on natural language,
 * then we execute it against the app's real backend.
 */

import { formatCurrency, formatTransactionList } from "./chatbotParser";
import {
  getAccounts,
  getTransactions,
  addTransaction,
} from "./db/finance/finance";
import { getSubscriptions } from "./db/finance/subscriptions/subscriptions";
import { invalidateCache } from "./db/cache";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// ─── Types ───────────────────────────────────────────────────────────

type Session = {
  access_token: string;
  refresh_token: string;
};

export type ConversationMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
};

// ─── Tool definitions for OpenAI ─────────────────────────────────────

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "add_transaction",
      description:
        "Add a new transaction (expense or income) to an account. Use this when the user wants to log, add, create, or record a transaction.",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["expense", "income"],
            description: "Whether this is an expense or income",
          },
          amount: {
            type: "number",
            description:
              "The amount in the main currency unit (e.g. 45.50 for forty-five euros fifty cents)",
          },
          description: {
            type: "string",
            description:
              "Short description or merchant name (e.g. 'groceries', 'uber', 'salary')",
          },
          category: {
            type: "string",
            description:
              "Category of the transaction (e.g. 'food', 'transport', 'salary')",
          },
          date: {
            type: "string",
            description:
              "Date in YYYY-MM-DD format. Use today's date if not specified.",
          },
        },
        required: ["type", "amount", "description"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_transactions",
      description:
        "List or show transactions for the current account. Use this when the user wants to see, view, list, or display their transactions.",
      parameters: {
        type: "object",
        properties: {
          filter_category: {
            type: "string",
            description: "Optional category to filter by",
          },
          filter_type: {
            type: "string",
            enum: ["expense", "income"],
            description: "Optional type to filter by",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_balance",
      description:
        "Get the balance of all accounts or the current account. Use when the user asks about their balance, how much money they have, etc.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_subscriptions",
      description: "List active subscriptions for the current account.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_transaction",
      description:
        "Update an existing transaction by its ID. Use when the user wants to change, edit, modify, or update a transaction.",
      parameters: {
        type: "object",
        properties: {
          transaction_id: {
            type: "number",
            description: "The ID of the transaction to update.",
          },
          amount: {
            type: "number",
            description: "New amount (optional)",
          },
          description: {
            type: "string",
            description: "New description (optional)",
          },
          category: {
            type: "string",
            description: "New category (optional)",
          },
        },
        required: ["transaction_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_transaction",
      description:
        "Delete a transaction by its ID. Use when the user wants to remove, delete, or cancel a transaction.",
      parameters: {
        type: "object",
        properties: {
          transaction_id: {
            type: "number",
            description: "The ID of the transaction to delete.",
          },
        },
        required: ["transaction_id"],
      },
    },
  },
];

// ─── System prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a friendly finance assistant embedded in a personal finance tracking app called "Finance Tracker". You help users manage their transactions, view their balance, and handle their financial data.

Key rules:
- Be concise and helpful. Use short, clear responses.
- When performing destructive actions (delete, update), always confirm with the user FIRST before calling the tool. Ask "Are you sure you want to delete/update transaction #X?" and wait for confirmation.
- Only call the tool AFTER the user confirms with "yes", "sure", "confirm", etc.
- When the user confirms a previously discussed destructive action, go ahead and call the tool.
- For adding transactions (non-destructive), you can call the tool immediately.
- For read operations (viewing transactions, balance, subscriptions), call the tool immediately.
- Format currency amounts nicely (e.g. €45.00, $120.50).
- If you're unsure what the user wants, ask for clarification.
- Today's date is ${new Date().toISOString().split("T")[0]}.
- The currency is always determined by the user's account — do NOT ask the user for currency.
- Keep responses short — no more than 2-3 sentences for simple confirmations.`;

// ─── Tool execution ──────────────────────────────────────────────────

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

async function executeTool(
  name: string,
  args: any,
  session: Session,
  accountId?: number,
  accountCurrency?: string,
): Promise<string> {
  try {
    switch (name) {
      case "add_transaction": {
        if (!accountId)
          return JSON.stringify({
            error:
              "No account selected. Please select an account on the dashboard first.",
          });
        const txType = args.type || "expense";
        const amountMinorAbs = Math.round((args.amount || 0) * 100);
        // Expenses must be negative, incomes positive — matching AddTransactionModal
        const signedAmount =
          txType === "expense" ? -amountMinorAbs : amountMinorAbs;
        const currency = accountCurrency || "EUR";
        const data = {
          type: txType,
          amount_minor: String(signedAmount),
          currency,
          description: args.description || args.category || "Transaction",
          merchant: args.category || args.description || "Transaction",
          date: args.date || new Date().toISOString().split("T")[0],
        };
        const result = await addTransaction(
          session.access_token,
          session.refresh_token,
          data,
          accountId,
        );
        return JSON.stringify({ success: true, transaction: result, currency });
      }

      case "get_transactions": {
        if (!accountId)
          return JSON.stringify({ error: "No account selected." });
        const txData = await getTransactions(
          session.access_token,
          session.refresh_token,
          accountId,
        );
        let transactions = (txData.rows || txData) as any[];
        transactions = transactions.map((t: any) => ({
          id: t.id,
          description: t.description || t.merchant || "Transaction",
          category: t.category || t.category_id || "",
          amount_minor: Number(t.amount_minor || 0),
          currency: t.currency || "EUR",
          date: t.date || t.created_at || "",
          type:
            t.type || (Number(t.amount_minor || 0) < 0 ? "expense" : "income"),
        }));

        if (args.filter_category) {
          const cat = args.filter_category.toLowerCase();
          transactions = transactions.filter(
            (t: any) =>
              (t.category || "").toLowerCase().includes(cat) ||
              (t.description || "").toLowerCase().includes(cat),
          );
        }
        if (args.filter_type) {
          transactions = transactions.filter(
            (t: any) => t.type === args.filter_type,
          );
        }

        return JSON.stringify({
          transactions: transactions.slice(0, 15),
          total: transactions.length,
        });
      }

      case "get_balance": {
        const accountsData = await getAccounts(
          session.access_token,
          session.refresh_token,
        );
        const accounts = accountsData.rows || accountsData;
        const balances = (accounts || []).map((acc: any) => ({
          name: acc.name,
          balance:
            acc.balance_minor !== undefined
              ? (acc.balance_minor / 100).toFixed(2)
              : "0.00",
          currency: acc.currency || "EUR",
        }));
        return JSON.stringify({ accounts: balances });
      }

      case "get_subscriptions": {
        if (!accountId)
          return JSON.stringify({ error: "No account selected." });
        const subsData = await getSubscriptions(
          session.access_token,
          session.refresh_token,
          accountId,
        );
        const subs = (subsData.rows || subsData) as any[];
        const mapped = subs.map((s: any) => ({
          id: s.id,
          merchant: s.merchant || s.name,
          amount: s.amount_minor ? (s.amount_minor / 100).toFixed(2) : "0.00",
          currency: s.currency || "EUR",
          active: s.active,
        }));
        return JSON.stringify({ subscriptions: mapped });
      }

      case "update_transaction": {
        if (!accountId)
          return JSON.stringify({ error: "No account selected." });
        if (!args.transaction_id)
          return JSON.stringify({ error: "No transaction ID provided." });
        const updateData: any = {};
        if (args.amount !== undefined)
          updateData.amount_minor = String(Math.round(args.amount * 100));
        if (args.description) updateData.description = args.description;
        if (args.category) updateData.category = args.category;

        const res = await authedFetch(
          `${BASE_URL}/finance/transactions/${accountId}/${args.transaction_id}`,
          session,
          { method: "PATCH", body: JSON.stringify(updateData) },
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return JSON.stringify({ error: errData.detail || "Update failed" });
        }
        invalidateCache(`/finance/transactions/${accountId}`);
        return JSON.stringify({ success: true, id: args.transaction_id });
      }

      case "delete_transaction": {
        if (!accountId)
          return JSON.stringify({ error: "No account selected." });
        if (!args.transaction_id)
          return JSON.stringify({ error: "No transaction ID provided." });
        const res = await authedFetch(
          `${BASE_URL}/finance/transactions/${accountId}/${args.transaction_id}`,
          session,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return JSON.stringify({ error: errData.detail || "Delete failed" });
        }
        invalidateCache(`/finance/transactions/${accountId}`);
        return JSON.stringify({ success: true, id: args.transaction_id });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err: any) {
    return JSON.stringify({ error: err?.message || "Tool execution failed" });
  }
}

// ─── Main chat function ──────────────────────────────────────────────

/**
 * Send a message to OpenAI and process the response, including any tool calls.
 * Returns the updated conversation history and the assistant's final text reply.
 */
export async function chat(
  apiKey: string,
  conversationHistory: ConversationMessage[],
  userMessage: string,
  session: Session,
  accountId?: number,
  accountCurrency?: string,
  model: string = "gpt-4o-mini",
): Promise<{ reply: string; history: ConversationMessage[] }> {
  // Build messages array
  const messages: ConversationMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const updatedHistory: ConversationMessage[] = [
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  try {
    // Call OpenAI
    let response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("OpenAI API error:", response.status, errBody);
      return {
        reply: `⚠️ AI service error (${response.status}). Please check your API key and try again.`,
        history: updatedHistory,
      };
    }

    let data = await response.json();
    let assistantMessage = data.choices?.[0]?.message;

    if (!assistantMessage) {
      return {
        reply: "No response from AI. Please try again.",
        history: updatedHistory,
      };
    }

    // Process tool calls in a loop (the model may chain multiple calls)
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (assistantMessage.tool_calls && iterations < MAX_ITERATIONS) {
      iterations++;

      // Add assistant message with tool calls to history
      updatedHistory.push({
        role: "assistant",
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      });

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        let fnArgs: any = {};
        try {
          fnArgs = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          fnArgs = {};
        }

        const toolResult = await executeTool(
          fnName,
          fnArgs,
          session,
          accountId,
          accountCurrency,
        );

        updatedHistory.push({
          role: "tool",
          content: toolResult,
          tool_call_id: toolCall.id,
          name: fnName,
        });
      }

      // Send tool results back to OpenAI for a final response
      const followUpMessages: ConversationMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...updatedHistory,
      ];

      response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: followUpMessages,
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        return {
          reply: "⚠️ AI service error while processing tool results.",
          history: updatedHistory,
        };
      }

      data = await response.json();
      assistantMessage = data.choices?.[0]?.message;

      if (!assistantMessage) {
        return {
          reply: "No response from AI after tool execution.",
          history: updatedHistory,
        };
      }
    }

    // Final text reply
    const reply = assistantMessage.content || "Done!";
    updatedHistory.push({ role: "assistant", content: reply });

    return { reply, history: updatedHistory };
  } catch (err: any) {
    console.error("Chat error:", err);
    return {
      reply: `⚠️ Connection error: ${err?.message || "Please check your network and try again."}`,
      history: updatedHistory,
    };
  }
}
