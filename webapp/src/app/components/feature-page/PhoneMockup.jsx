"use client";

import {
  BarChart2,
  Bell,
  ChevronDown,
  ChevronRight,
  Download,
  Home,
  MessageCircle,
  MoreVertical,
  PieChart,
  Search,
  User,
  X,
} from "lucide-react";

const POS = "#16b364";
const NEG = "#e5392b";

/* -------------------------------------------------------------------------- */
/*  Shared chrome                                                             */
/* -------------------------------------------------------------------------- */

function StatusBar() {
  return (
    <div className="relative z-10 flex h-[13.8cqw] shrink-0 items-start">
      <img
        src="/mockups/ios-status-bar.svg"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center gap-[3cqw] pt-[1cqw]">
      <span className="flex h-[10cqw] w-[10cqw] shrink-0 items-center justify-center rounded-full bg-gray-100">
        <User className="h-[4.4cqw] w-auto text-black" />
      </span>
      <div className="flex h-[10cqw] flex-1 items-center gap-[2cqw] rounded-full bg-gray-100 px-[4cqw]">
        <Search className="h-[4cqw] w-auto text-gray-400" />
        <span className="text-[3.8cqw] text-gray-400">Search</span>
      </div>
      <span className="flex h-[10cqw] w-[10cqw] shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Bell className="h-[4.4cqw] w-auto text-black" />
      </span>
    </div>
  );
}

function NavBar({ active = 0 }) {
  const items = [Home, BarChart2, PieChart, MessageCircle];
  return (
    <div className="mt-auto flex items-center justify-around px-[4cqw] pb-[20px]">
      {items.map((Icon, i) => (
        <Icon
          key={i}
          className="h-[5.5cqw] w-auto"
          style={{ color: i === active ? "#000" : "#9ca3af" }}
        />
      ))}
    </div>
  );
}

function Field({ label, placeholder }) {
  return (
    <div className="mt-[3.5cqw]">
      <p className="text-[3.6cqw] font-bold text-black">{label}</p>
      <div className="mt-[2cqw] flex h-[11cqw] items-center rounded-full bg-gray-100 px-[5cqw]">
        <span className="text-[3.8cqw] text-gray-400">{placeholder}</span>
      </div>
    </div>
  );
}

function Dropdown({ label, value }) {
  return (
    <div className="mt-[3.5cqw]">
      <p className="text-[3.6cqw] font-bold text-black">{label}</p>
      <div className="mt-[2cqw] flex h-[11cqw] items-center justify-between rounded-full bg-gray-100 px-[5cqw]">
        <span className="text-[3.8cqw] text-black">{value}</span>
        <ChevronDown className="h-[4cqw] w-auto text-gray-500" />
      </div>
    </div>
  );
}

function PrimaryButton({ children }) {
  return (
    <div className="mt-[6cqw] flex h-[12cqw] items-center justify-center rounded-full bg-black">
      <span className="text-[4cqw] font-bold text-white">{children}</span>
    </div>
  );
}

function Donut({ gradient, size = 44, children }) {
  return (
    <div
      className="relative mx-auto rounded-full"
      style={{
        width: `${size}cqw`,
        height: `${size}cqw`,
        background: gradient,
      }}
    >
      <div className="absolute left-1/2 top-1/2 flex h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Screens                                                                   */
/* -------------------------------------------------------------------------- */

function TransactionsScreen() {
  return (
    <div className="flex h-full flex-col px-[6cqw] pt-[2cqw]">
      <h1 className="text-[6.8cqw] font-bold text-black">Transaction</h1>

      <p className="mt-[3.5cqw] text-[3.6cqw] font-bold text-black">Type</p>
      <div className="mt-[2cqw] flex rounded-full bg-gray-100 p-[1.2cqw]">
        <span className="flex-1 rounded-full bg-black py-[2.6cqw] text-center text-[3.8cqw] font-bold text-white">
          Expense
        </span>
        <span className="flex-1 py-[2.6cqw] text-center text-[3.8cqw] font-bold text-gray-500">
          Income
        </span>
      </div>

      <Dropdown label="Account" value="Giro (EUR)" />
      <Field label="Amount" placeholder="e.g. € 0.00" />
      <Field label="Recipient" placeholder="e.g. Grocery Store" />
      <Field label="Usage" placeholder="e.g. Groceries, Rent, Salary…" />

      <PrimaryButton>Add Transaction</PrimaryButton>
    </div>
  );
}

function SubscriptionsScreen() {
  return (
    <div className="flex h-full flex-col px-[6cqw] pt-[2cqw]">
      <h1 className="text-[6.8cqw] font-bold text-black">Add Subscription</h1>

      <Dropdown label="Account" value="Credit Card (EUR)" />
      <Field label="Merchant" placeholder="e.g. Netflix" />
      <Field label="Amount" placeholder="e.g. 9.99" />
      <Dropdown label="Billing Period" value="Month" />
      <Field label="Start Date" placeholder="YYYY-MM-DD" />

      <PrimaryButton>Add</PrimaryButton>
    </div>
  );
}

function Tab({ children, active }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-[4cqw] py-[2cqw] text-[3.4cqw] font-bold ${
        active ? "bg-black text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </span>
  );
}

function Row({ title, sub, amount, color }) {
  return (
    <div className="flex items-center justify-between py-[2.4cqw]">
      <div>
        <p className="text-[4cqw] font-bold text-black">{title}</p>
        <p className="text-[3.2cqw] text-gray-400">{sub}</p>
      </div>
      <p className="text-[4cqw] font-bold" style={{ color }}>
        {amount}
      </p>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="flex h-full flex-col px-[6cqw] pt-[1cqw]">
      <TopBar />
      <h1 className="mt-[3cqw] text-[6.8cqw] font-bold text-black">Analysis</h1>

      <div className="mt-[3cqw] flex gap-[2cqw] overflow-hidden">
        <Tab active>Overview</Tab>
        <Tab>Expenses</Tab>
        <Tab>Income</Tab>
        <Tab>Subscriptions</Tab>
      </div>

      <div className="mt-[3cqw] flex h-[10cqw] items-center justify-between rounded-full bg-gray-100 px-[5cqw]">
        <span className="text-[3.8cqw] text-black">Credit Card (EUR)</span>
        <ChevronDown className="h-[4cqw] w-auto text-gray-500" />
      </div>

      <div className="relative mt-[4cqw]">
        <MoreVertical className="absolute right-0 top-0 h-[4.5cqw] w-auto text-gray-400" />
        <Donut gradient={`conic-gradient(${NEG} 0% 11%, #3ec46d 11% 100%)`}>
          <span className="text-[3cqw] text-gray-500">Monthly standing</span>
          <span className="text-[5.4cqw] font-bold" style={{ color: POS }}>
            +2.480,00 €
          </span>
          <span className="text-[2.7cqw] text-gray-400">1. Mar – 31. Mar.</span>
        </Donut>
      </div>

      <div className="mt-[4cqw] flex items-start gap-[2.5cqw] rounded-[4cqw] bg-gray-50 p-[4cqw]">
        <span className="text-[4cqw]">🎉</span>
        <div className="flex-1">
          <p className="text-[3.6cqw] font-bold text-black">Suggestion</p>
          <p className="mt-[1cqw] text-[3.1cqw] leading-[1.5] text-gray-500">
            Great job — you earned more than you spent this month! 🎉 Keep it up
            and consider saving or investing the extra.
          </p>
        </div>
        <X className="h-[3.6cqw] w-auto text-gray-400" />
      </div>

      <p className="mt-[4cqw] text-[4.4cqw] font-bold text-black">
        Transactions
      </p>
      <Row title="Doctor" sub="Other" amount="-500.00 €" color={NEG} />
      <Row title="Salary" sub="Other" amount="+3000.00 €" color={POS} />

      <NavBar active={2} />
    </div>
  );
}

function LogoSquare({ label, bg, color = "#fff", logo }) {
  return (
    <span
      className="relative flex h-[10cqw] w-[10cqw] shrink-0 items-center justify-center overflow-hidden rounded-[2.5cqw] text-[3cqw] font-bold"
      style={{ backgroundColor: bg, color }}
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="h-[7cqw] w-[7cqw] object-contain"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling.style.display = "block";
          }}
        />
      ) : null}
      <span style={{ display: logo ? "none" : "block" }}>{label}</span>
    </span>
  );
}

function StockRow({ ticker, price, pct, up, bg, fg, logo }) {
  return (
    <div className="flex items-center justify-between py-[2cqw]">
      <div className="flex items-center gap-[3cqw]">
        <LogoSquare label={ticker.slice(0, 2)} bg={bg} color={fg} logo={logo} />
        <div>
          <p className="text-[4cqw] font-bold text-black">{ticker}</p>
          <p className="text-[3.2cqw] text-gray-400">{price}</p>
        </div>
      </div>
      <span
        className="flex items-center gap-[1cqw] text-[3.8cqw] font-bold"
        style={{ color: up ? POS : NEG }}
      >
        <span className="text-[3cqw]">{up ? "▲" : "▼"}</span>
        {pct}
      </span>
    </div>
  );
}

function InvestmentsScreen() {
  const trending = [
    {
      ticker: "INTC",
      price: "$42.79",
      pct: "15.95%",
      up: true,
      bg: "#00b2e3",
      logo: "/logos/stocks/intc.png",
    },
    {
      ticker: "LUCY",
      price: "$1.70",
      pct: "70.66%",
      up: true,
      bg: "#ededed",
      fg: "#333",
      logo: "/logos/stocks/lucy.png",
    },
    {
      ticker: "CRWD",
      price: "$482.13",
      pct: "2.85%",
      up: true,
      bg: "#e1352b",
      logo: "/logos/stocks/crwd.png",
    },
    {
      ticker: "VTYX",
      price: "$13.72",
      pct: "51.94%",
      up: true,
      bg: "#f4fbff",
      fg: "#2b5cc4",
      logo: "/logos/stocks/vtyx.png",
    },
    {
      ticker: "GME",
      price: "$21.27",
      pct: "5.95%",
      up: true,
      bg: "#111",
      logo: "/logos/stocks/gme.png",
    },
    {
      ticker: "BX",
      price: "$155.08",
      pct: "0.61%",
      up: true,
      bg: "#111",
      logo: "/logos/stocks/bx.png",
    },
    {
      ticker: "PANW",
      price: "$195.26",
      pct: "6.00%",
      up: true,
      bg: "#fff4ef",
      fg: "#f4814f",
      logo: "/logos/stocks/panw.png",
    },
    {
      ticker: "MBLY",
      price: "$12.25",
      pct: "17.34%",
      up: true,
      bg: "#2b4cc4",
      logo: "/logos/stocks/mbly.png",
    },
    {
      ticker: "SWKS",
      price: "$58.83",
      pct: "7.23%",
      up: false,
      bg: "#f4fbff",
      fg: "#176b7d",
      logo: "/logos/stocks/swks.png",
    },
  ];

  return (
    <div className="flex h-full flex-col px-[6cqw] pt-[2cqw]">
      <div className="flex h-[10cqw] items-center gap-[2cqw] rounded-full bg-gray-100 px-[4cqw]">
        <Search className="h-[4cqw] w-auto text-gray-400" />
        <span className="text-[3.8cqw] text-gray-400">Search</span>
      </div>

      <p className="mt-[4cqw] text-[4.6cqw] font-bold text-black">
        Your investments
      </p>
      <StockRow
        ticker="TSLA"
        price="$435.35"
        pct="3.20%"
        up={false}
        bg="#fff4f4"
        fg="#e1352b"
        logo="/logos/stocks/tsla.png"
      />

      <p className="mt-[3cqw] text-[4.6cqw] font-bold text-black">Trending</p>
      <div className="overflow-hidden">
        {trending.map((s) => (
          <StockRow key={s.ticker} {...s} />
        ))}
      </div>
    </div>
  );
}

function SavingsRow({ title, amount }) {
  return (
    <div className="flex items-center justify-between py-[2.4cqw]">
      <div>
        <div className="flex items-center gap-[2cqw]">
          <p className="text-[4cqw] font-bold text-black">{title}</p>
          <ChevronRight className="h-[3.6cqw] w-auto text-gray-400" />
        </div>
        <p className="text-[3.2cqw] text-gray-400">FT</p>
      </div>
      <p className="text-[3.8cqw] font-bold" style={{ color: POS }}>
        {amount}
      </p>
    </div>
  );
}

function SavingsScreen() {
  return (
    <div className="flex h-full flex-col px-[6cqw] pt-[1cqw]">
      <TopBar />

      <div className="mt-[3cqw] flex rounded-full bg-gray-100 p-[1.2cqw]">
        <span className="flex-1 py-[2.6cqw] text-center text-[3.8cqw] font-bold text-gray-500">
          Investments
        </span>
        <span className="flex-1 rounded-full bg-black py-[2.6cqw] text-center text-[3.8cqw] font-bold text-white">
          Savings
        </span>
      </div>

      <div className="mt-[5cqw]">
        <Donut
          size={46}
          gradient="conic-gradient(#1e3a5f 0% 16%, #2c5282 16% 24%, #0f1f33 24% 28%, #2c5282 28% 40%, #a7b8cd 40% 100%)"
        >
          <span className="text-[6cqw] font-bold" style={{ color: POS }}>
            €417,00
          </span>
        </Donut>
      </div>

      <p className="mt-[5cqw] text-[4.6cqw] font-bold text-black">Savings</p>
      <SavingsRow title="Lirililarila" amount="€270.00" />
      <SavingsRow title="Test2" amount="€-10.00" />

      <div className="flex items-center justify-between py-[2.4cqw]">
        <div>
          <p className="text-[4cqw] font-bold text-black">Test</p>
          <p className="text-[3.2cqw] text-gray-400">FT</p>
        </div>
        <div className="flex h-[10cqw] items-center justify-center rounded-full bg-black px-[6cqw]">
          <span className="text-[3.8cqw] font-bold text-white">Add +</span>
        </div>
      </div>

      <NavBar active={1} />
    </div>
  );
}

function AccountsScreen() {
  return (
    <div className="flex h-full flex-col px-[6cqw] pt-[1cqw]">
      <TopBar />

      <div className="mt-[3cqw] flex items-center justify-between">
        <span className="flex-1 text-center text-[4.6cqw] font-bold text-black">
          Good morning Jane Doe!
        </span>
        <Download className="h-[5cqw] w-auto text-black" />
      </div>

      <div className="relative mt-[3cqw] h-[135px] overflow-hidden rounded-[5cqw] bg-[#161616] p-[5cqw]">
        <div className="absolute -right-[10cqw] -top-[10cqw] h-[30cqw] w-[30cqw] rounded-full bg-white/[0.06] blur-xl" />
        <span className="absolute right-[5cqw] top-[5cqw] flex h-[9cqw] w-[9cqw] items-center justify-center rounded-sm bg-white/10">
          <span className="text-[4cqw] font-bold text-white">FT</span>
        </span>
        <p className="text-[2.8cqw] font-bold uppercase tracking-wide text-gray-400">
          Manual
        </p>
        <p className="text-[5cqw] font-bold text-white">Giro</p>
        <p className="mt-[5cqw] text-[2.8cqw] font-bold uppercase tracking-wide text-gray-400">
          Balance
        </p>
        <p className="text-[5.5cqw] font-bold" style={{ color: POS }}>
          €10.02
        </p>
      </div>

      <div className="mt-[3cqw] flex items-center justify-center gap-[1.6cqw]">
        <span className="h-[1.6cqw] w-[5cqw] rounded-full bg-[#1e3a5f]" />
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-[1.6cqw] w-[1.6cqw] rounded-full bg-gray-300"
          />
        ))}
      </div>

      <p className="mt-[4cqw] text-[4.4cqw] font-bold text-black">
        Transactions
      </p>
      <Row title="Allowance" sub="Other" amount="+50.00 €" color={POS} />
      <Row title="Groceries" sub="Other" amount="-20.00 €" color={NEG} />
      <Row title="Netflix" sub="Subscription" amount="-9.99 €" color={NEG} />
      <Row
        title="Disney Plus"
        sub="Subscription"
        amount="-9.99 €"
        color={NEG}
      />

      <div className="mt-[2cqw] flex justify-end">
        <div className="flex h-[10cqw] items-center justify-center rounded-full bg-black px-[6cqw]">
          <span className="text-[3.8cqw] font-bold text-white">Add +</span>
        </div>
      </div>

      <NavBar active={0} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mockup wrapper                                                            */
/* -------------------------------------------------------------------------- */

const screens = {
  transactions: { time: "20:04", Screen: TransactionsScreen },
  subscriptions: { time: "20:28", Screen: SubscriptionsScreen },
  analytics: { time: "23:05", Screen: AnalyticsScreen },
  investments: { time: "20:26", Screen: InvestmentsScreen },
  savings: { time: "23:02", Screen: SavingsScreen },
  accounts: { time: "22:55", Screen: AccountsScreen },
};

export default function PhoneMockup({
  screen = "analytics",
  title = "App preview",
}) {
  const { Screen } = screens[screen] ?? screens.analytics;

  return (
    <div
      className="@container relative mx-auto aspect-[450/920] w-full max-w-[360px]"
      role="img"
      aria-label={title}
    >
      <div className="absolute -inset-4 rounded-[18cqw] bg-black/10 blur-2xl" />
      <div className="absolute inset-[1.5%_3%_1%] overflow-hidden rounded-[10.6cqw] bg-white">
        <div className="absolute inset-0 flex flex-col">
          <StatusBar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Screen />
          </div>
        </div>
      </div>
      <img
        src="/mockups/iphone-17-pro-silver-portrait.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full scale-[1.018] select-none"
      />
    </div>
  );
}
