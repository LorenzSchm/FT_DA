/**
 * chatbotParser.ts
 *
 * Rule-based NLP parser for the finance chatbot.
 * Extracts intent (CREATE / READ / UPDATE / DELETE) and entities
 * (amount, category, description, date, id, type, account) from
 * natural-language messages.
 */

// ─── Types ───────────────────────────────────────────────────────────
export type Intent =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "CONFIRM"
  | "UNKNOWN";

export type TransactionType = "expense" | "income" | "transfer";

export interface ParsedCommand {
  intent: Intent;
  /** e.g. "expense", "income", "transfer", "transaction", "subscription", "account", "balance", "budget" */
  entity?: string;
  type?: TransactionType;
  amount?: number;
  /** Amount stored in minor units (cents) */
  amountMinor?: number;
  currency?: string;
  category?: string;
  description?: string;
  date?: string;
  id?: number;
  fromAccount?: string;
  toAccount?: string;
  /** Raw text for fallback display */
  raw: string;
  /** Whether the user confirmed a pending action */
  confirmed?: boolean;
}

// ─── Keyword maps ────────────────────────────────────────────────────
const CREATE_KEYWORDS = [
  "add",
  "create",
  "new",
  "insert",
  "log",
  "record",
  "make",
];
const READ_KEYWORDS = [
  "show",
  "list",
  "display",
  "get",
  "view",
  "what",
  "how much",
  "balance",
  "total",
  "summary",
];
const UPDATE_KEYWORDS = ["change", "update", "edit", "modify", "set", "rename"];
const DELETE_KEYWORDS = ["delete", "remove", "cancel", "erase"];
const CONFIRM_KEYWORDS = [
  "yes",
  "yeah",
  "yep",
  "sure",
  "confirm",
  "ok",
  "okay",
  "do it",
  "go ahead",
  "y",
];
const DENY_KEYWORDS = [
  "no",
  "nah",
  "nope",
  "cancel",
  "stop",
  "don't",
  "abort",
  "n",
];

const EXPENSE_KEYWORDS = [
  "expense",
  "spending",
  "spent",
  "cost",
  "payment",
  "pay",
  "bought",
  "purchase",
];
const INCOME_KEYWORDS = [
  "income",
  "salary",
  "earning",
  "earned",
  "received",
  "deposit",
  "paycheck",
  "bonus",
  "revenue",
];
const TRANSFER_KEYWORDS = ["transfer", "move", "send"];

// ─── Helpers ─────────────────────────────────────────────────────────

/** Normalise input for matching */
function norm(text: string): string {
  return text.toLowerCase().trim();
}

/** Check if text starts with any of the keywords */
function matchesAny(text: string, keywords: string[]): boolean {
  const t = norm(text);
  return keywords.some((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "i");
    return re.test(t);
  });
}

/** Extract a number that looks like an amount (supports $, €, commas) */
function extractAmount(text: string): number | undefined {
  // Match patterns like: 45, 45.50, $45, €45.50, 1,200.00
  const amountRegex = /[$€£]?\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\b/;
  const match = text.match(amountRegex);
  if (match) {
    const cleaned = match[1].replace(/,/g, "");
    const val = parseFloat(cleaned);
    if (!isNaN(val) && val > 0) return val;
  }
  return undefined;
}

/** Extract an ID: "id 67", "#67", "transaction 67", "id:67" */
function extractId(text: string): number | undefined {
  const patterns = [
    /(?:id|#|transaction|expense|income)\s*:?\s*#?(\d+)/i,
    /#(\d+)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n)) return n;
    }
  }
  return undefined;
}

/** Attempt to extract a date keyword */
function extractDate(text: string): string | undefined {
  const t = norm(text);
  if (t.includes("today")) return new Date().toISOString().split("T")[0];
  if (t.includes("yesterday")) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  // Named months
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  for (let i = 0; i < months.length; i++) {
    if (t.includes(months[i]) || t.includes(months[i].slice(0, 3))) {
      const year = new Date().getFullYear();
      const month = String(i + 1).padStart(2, "0");
      return `${year}-${month}-01`;
    }
  }

  // ISO-like dates: 2024-03-15 or 15/03/2024
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  return undefined;
}

/** Extract a category / description — words after the amount that aren't dates or IDs */
function extractCategory(text: string): string | undefined {
  const t = norm(text);

  // Remove known prefixes / keywords
  const cleaned = t
    .replace(/[$€£]?\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?/g, "") // numbers
    .replace(
      /\b(add|create|new|insert|log|record|make|show|list|display|get|view|delete|remove|update|change|edit|modify|expense|income|transfer|transaction|subscription|today|yesterday|this|month|last|my|the|a|an|to|from|for|in|of|id|#)\b/gi,
      "",
    )
    .replace(/\d+/g, "") // remaining numbers
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length > 1) return cleaned;
  return undefined;
}

/** Detect transaction type from text */
function detectType(text: string): TransactionType | undefined {
  const t = norm(text);
  if (matchesAny(t, TRANSFER_KEYWORDS)) return "transfer";
  if (matchesAny(t, EXPENSE_KEYWORDS)) return "expense";
  if (matchesAny(t, INCOME_KEYWORDS)) return "income";
  return undefined;
}

/** Detect which entity is being talked about */
function detectEntity(text: string): string | undefined {
  const t = norm(text);
  if (/\bsubscription/i.test(t)) return "subscription";
  if (/\baccount/i.test(t)) return "account";
  if (/\bbudget/i.test(t)) return "budget";
  if (/\bbalance/i.test(t)) return "balance";
  if (/\bsaving/i.test(t)) return "saving";
  if (/\btransaction/i.test(t)) return "transaction";
  if (matchesAny(t, EXPENSE_KEYWORDS)) return "transaction";
  if (matchesAny(t, INCOME_KEYWORDS)) return "transaction";
  if (matchesAny(t, TRANSFER_KEYWORDS)) return "transaction";
  return "transaction"; // default
}

/** Extract "from X to Y" account names for transfers */
function extractTransferAccounts(text: string): { from?: string; to?: string } {
  const match = text.match(/from\s+(\w+)\s+to\s+(\w+)/i);
  if (match) return { from: match[1], to: match[2] };
  return {};
}

// ─── Main parser ─────────────────────────────────────────────────────

export function parseMessage(text: string): ParsedCommand {
  const t = norm(text);

  // Check for simple confirmation / denial first
  if (matchesAny(t, CONFIRM_KEYWORDS) && t.split(/\s+/).length <= 3) {
    return { intent: "CONFIRM", confirmed: true, raw: text };
  }
  if (matchesAny(t, DENY_KEYWORDS) && t.split(/\s+/).length <= 3) {
    return { intent: "CONFIRM", confirmed: false, raw: text };
  }

  // Detect intent
  let intent: Intent = "UNKNOWN";
  if (matchesAny(t, CREATE_KEYWORDS)) intent = "CREATE";
  else if (matchesAny(t, READ_KEYWORDS)) intent = "READ";
  else if (matchesAny(t, UPDATE_KEYWORDS)) intent = "UPDATE";
  else if (matchesAny(t, DELETE_KEYWORDS)) intent = "DELETE";

  const amount = extractAmount(text);
  const transferAccounts = extractTransferAccounts(text);

  return {
    intent,
    entity: detectEntity(text),
    type: detectType(text),
    amount,
    amountMinor: amount !== undefined ? Math.round(amount * 100) : undefined,
    currency: text.includes("$") ? "USD" : text.includes("£") ? "GBP" : "EUR",
    category: extractCategory(text),
    description: extractCategory(text),
    date: extractDate(text),
    id: extractId(text),
    fromAccount: transferAccounts.from,
    toAccount: transferAccounts.to,
    raw: text,
  };
}

// ─── Response formatters ─────────────────────────────────────────────

export function formatCurrency(
  amountMinor: number,
  currency: string = "EUR",
): string {
  const value = (amountMinor / 100).toFixed(2);
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    CHF: "CHF ",
  };
  const sym = symbols[currency] || currency + " ";
  return `${sym}${value}`;
}

export function formatTransactionList(transactions: any[]): string {
  if (!transactions || transactions.length === 0)
    return "No transactions found.";

  const lines = transactions.slice(0, 10).map((t: any, i: number) => {
    const amount = t.amount_minor !== undefined ? t.amount_minor : 0;
    const isExpense = amount < 0;
    const sign = isExpense ? "" : "+";
    const currency = t.currency || "EUR";
    const desc = t.description || t.merchant || "Transaction";
    const cat = t.category_id || t.category || "";
    const date = t.date ? ` (${t.date})` : "";
    return `• ${desc}${cat ? ` [${cat}]` : ""}: ${sign}${formatCurrency(Math.abs(amount), currency)}${date}`;
  });

  if (transactions.length > 10) {
    lines.push(`\n...and ${transactions.length - 10} more.`);
  }

  return lines.join("\n");
}
