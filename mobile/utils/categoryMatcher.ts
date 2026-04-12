/**
 * categoryMatcher.ts
 *
 * Smart category suggestion: maps merchant names / descriptions to a
 * finance.categories name using keyword rules, then resolves to a category
 * object from the full categories list.
 */

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string;
  is_income: boolean;
}

// ─── Keyword → category name map ──────────────────────────────────────────────
// Keys are lowercase substrings to match against; values are category names
// that must exist in finance.categories.
const EXPENSE_KEYWORDS: Record<string, string> = {
  // Food & Groceries
  grocery: "Groceries",
  groceries: "Groceries",
  supermarket: "Groceries",
  rewe: "Groceries",
  aldi: "Groceries",
  lidl: "Groceries",
  edeka: "Groceries",
  netto: "Groceries",
  penny: "Groceries",
  walmart: "Groceries",
  "whole foods": "Groceries",
  "trader joe": "Groceries",
  safeway: "Groceries",
  kroger: "Groceries",
  tesco: "Groceries",
  carrefour: "Groceries",
  spar: "Groceries",
  lebensmittel: "Groceries",

  // Dining Out
  restaurant: "Dining Out",
  "dining out": "Dining Out",
  mcdonalds: "Dining Out",
  "mcdonald's": "Dining Out",
  "burger king": "Dining Out",
  burgerking: "Dining Out",
  pizza: "Dining Out",
  subway: "Dining Out",
  kfc: "Dining Out",
  "taco bell": "Dining Out",
  chipotle: "Dining Out",
  dominos: "Dining Out",
  wendy: "Dining Out",
  diner: "Dining Out",
  bistro: "Dining Out",
  kebab: "Dining Out",

  // Coffee
  starbucks: "Coffee or Snacks",
  coffee: "Coffee or Snacks",
  café: "Coffee or Snacks",
  cafe: "Coffee or Snacks",
  kaffee: "Coffee or Snacks",
  "costa coffee": "Coffee or Snacks",
  dunkin: "Coffee or Snacks",
  snack: "Coffee or Snacks",

  // Meal delivery
  "uber eats": "Meal Delivery",
  ubereats: "Meal Delivery",
  deliveroo: "Meal Delivery",
  doordash: "Meal Delivery",
  lieferando: "Meal Delivery",
  "just eat": "Meal Delivery",
  "food delivery": "Meal Delivery",

  // Streaming
  netflix: "Streaming Services",
  spotify: "Streaming Services",
  disney: "Streaming Services",
  "amazon prime": "Streaming Services",
  "apple music": "Streaming Services",
  hulu: "Streaming Services",
  "hbo max": "Streaming Services",
  dazn: "Streaming Services",
  crunchyroll: "Streaming Services",
  twitch: "Streaming Services",

  // Housing
  rent: "Rent or Mortgage",
  miete: "Rent or Mortgage",
  mortgage: "Rent or Mortgage",
  housing: "Rent or Mortgage",

  // Utilities
  electricity: "Utilities",
  "electric bill": "Utilities",
  "gas bill": "Utilities",
  "water bill": "Utilities",
  internet: "Utilities",
  broadband: "Utilities",
  telephone: "Utilities",
  "phone bill": "Utilities",
  strom: "Utilities",
  wasser: "Utilities",
  heizung: "Utilities",

  // Transportation
  uber: "Transportation",
  lyft: "Transportation",
  taxi: "Transportation",
  "car rental": "Transportation",
  mietwagen: "Transportation",

  // Fuel
  fuel: "Fuel",
  petrol: "Fuel",
  gasoline: "Fuel",
  benzin: "Fuel",
  shell: "Fuel",
  bp: "Fuel",
  total: "Fuel",
  aral: "Fuel",
  esso: "Fuel",
  "gas station": "Fuel",
  tankstelle: "Fuel",

  // Public transit
  "public transit": "Public Transit",
  "train ticket": "Public Transit",
  "bus ticket": "Public Transit",
  "metro ticket": "Public Transit",
  "bahn": "Public Transit",
  "mvv": "Public Transit",
  "hvv": "Public Transit",
  "bvg": "Public Transit",
  "rnv": "Public Transit",
  "öpnv": "Public Transit",

  // Parking
  parking: "Parking and Tolls",
  toll: "Parking and Tolls",
  parken: "Parking and Tolls",
  maut: "Parking and Tolls",

  // Health
  pharmacy: "Medical Bills",
  apotheke: "Medical Bills",
  doctor: "Medical Bills",
  hospital: "Medical Bills",
  arzt: "Medical Bills",
  klinik: "Medical Bills",
  "medical bill": "Medical Bills",
  "health bill": "Medical Bills",
  prescription: "Medical Bills",

  // Gym
  gym: "Gym Memberships",
  fitness: "Gym Memberships",
  "fitness center": "Gym Memberships",
  fitnessstudio: "Gym Memberships",
  "planet fitness": "Gym Memberships",
  mcfit: "Gym Memberships",

  // Insurance
  insurance: "Health Insurance",
  versicherung: "Health Insurance",
  "auto insurance": "Auto Insurance",
  kfz: "Auto Insurance",
  "life insurance": "Life Insurance",

  // Shopping
  amazon: "Miscellaneous Expenses",
  ebay: "Miscellaneous Expenses",
  zalando: "Clothing and Personal Care",
  "h&m": "Apparel",
  zara: "Apparel",
  clothing: "Apparel",
  fashion: "Apparel",
  kleidung: "Apparel",
  shoes: "Shoes",
  schuhe: "Shoes",

  // Education
  university: "Tuition or Fees",
  school: "Tuition or Fees",
  tuition: "Tuition or Fees",
  course: "Books and Supplies",
  books: "Books and Supplies",
  udemy: "Books and Supplies",
  coursera: "Books and Supplies",

  // Entertainment
  movie: "Movies or Events",
  cinema: "Movies or Events",
  kino: "Movies or Events",
  theater: "Movies or Events",
  concert: "Movies or Events",
  event: "Movies or Events",
  ticket: "Movies or Events",

  // Donations
  donation: "Donations",
  spende: "Donations",
  charity: "Donations",

  // Taxes
  tax: "Income Taxes",
  steuer: "Income Taxes",
};

const INCOME_KEYWORDS: Record<string, string> = {
  salary: "Salary or Wages",
  wage: "Salary or Wages",
  payroll: "Salary or Wages",
  gehalt: "Salary or Wages",
  lohn: "Salary or Wages",
  paycheck: "Salary or Wages",
  "direct deposit": "Salary or Wages",

  bonus: "Bonuses and Commissions",
  commission: "Bonuses and Commissions",
  pramie: "Bonuses and Commissions",

  overtime: "Overtime Pay",
  uberstunden: "Overtime Pay",

  tips: "Tips or Gratuities",
  trinkgeld: "Tips or Gratuities",

  freelance: "Freelance or Consulting",
  consulting: "Freelance or Consulting",
  invoice: "Freelance or Consulting",
  rechnung: "Freelance or Consulting",
  honorar: "Freelance or Consulting",

  dividend: "Dividends",
  dividende: "Dividends",

  interest: "Interest",
  zinsen: "Interest",

  "capital gain": "Capital Gains",
  "stock sale": "Capital Gains",

  "rental income": "Rental Income",
  mieteinnahmen: "Rental Income",

  "tax refund": "Tax Refunds",
  steuererstattung: "Tax Refunds",
  erstattung: "Tax Refunds",

  reimbursement: "Reimbursements",
  erstattung: "Reimbursements",

  gift: "Gifts or Inheritances",
  geschenk: "Gifts or Inheritances",
  inheritance: "Gifts or Inheritances",

  pension: "Social Security or Pension",
  rente: "Social Security or Pension",
  "social security": "Social Security or Pension",

  "unemployment benefit": "Unemployment Benefits",
  arbeitslosengeld: "Unemployment Benefits",

  "child benefit": "Alimony or Child Support",
  kindergeld: "Alimony or Child Support",
  alimony: "Alimony or Child Support",
};

// ─── Matching logic ────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Given a merchant/description text and a transaction type, returns the
 * best-matching category name string (to be resolved against the category list).
 */
export function suggestCategoryName(
  text: string,
  isIncome: boolean,
): string | null {
  const t = normalize(text);
  const keywords = isIncome ? INCOME_KEYWORDS : EXPENSE_KEYWORDS;

  // Sort by key length descending so longer (more specific) phrases match first
  const sorted = Object.keys(keywords).sort((a, b) => b.length - a.length);

  for (const keyword of sorted) {
    if (t.includes(keyword)) {
      return keywords[keyword];
    }
  }
  return null;
}

/**
 * Given a category name (from suggestCategoryName) and the full category list,
 * returns the matching Category object or null.
 */
export function resolveCategory(
  name: string | null,
  categories: Category[],
  isIncome: boolean,
): Category | null {
  if (!name) return null;
  const nameLower = name.toLowerCase();
  return (
    categories.find(
      (c) =>
        c.is_income === isIncome &&
        c.name.toLowerCase() === nameLower,
    ) ?? null
  );
}

/**
 * Main entry: given merchant + description text and the full categories list,
 * returns a suggested Category object or null.
 */
export function suggestCategory(
  merchant: string,
  description: string,
  isIncome: boolean,
  categories: Category[],
): Category | null {
  const combined = `${merchant} ${description}`;
  const suggestedName = suggestCategoryName(combined, isIncome);
  return resolveCategory(suggestedName, categories, isIncome);
}
