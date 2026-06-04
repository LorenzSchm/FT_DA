"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  BarChart2,
  CreditCard,
  Layers,
  Repeat,
  Target,
  TrendingUp,
} from "react-feather";

export default function FeaturePage() {
  const features = [
    {
      title: "Track Expenses & Income",
      label: "Transactions",
      description:
        "Log income and spending fast, keep categories tidy, and understand cash flow without digging through bank statements.",
      screenshot: "/screenshots/tracking_expenses.png",
      icon: CreditCard,
      stat: "2-tap entry",
    },
    {
      title: "Manage Subscriptions",
      label: "Recurring",
      description:
        "Track recurring charges in one place, spot upcoming renewals, and see which subscriptions are worth keeping.",
      screenshot: "/screenshots/subs.png",
      icon: Repeat,
      stat: "Upcoming view",
    },
    {
      title: "Financial Analytics",
      label: "Insights",
      description:
        "Turn transactions into clear trends with category breakdowns, period filters, and readable charts.",
      screenshot: "/screenshots/analytics.png",
      icon: BarChart2,
      stat: "Live charts",
    },
    {
      title: "Investment Portfolio",
      label: "Portfolio",
      description:
        "Follow positions, check performance, and keep investments in the same place as day-to-day finances.",
      screenshot: "/screenshots/investments.png",
      icon: TrendingUp,
      stat: "P/L tracking",
    },
    {
      title: "Savings Accounts",
      label: "Goals",
      description:
        "Create dedicated goals, track progress visually, and keep every target connected to real account activity.",
      screenshot: "/screenshots/savings.png",
      icon: Target,
      stat: "Goal progress",
    },
    {
      title: "Account Management",
      label: "Accounts",
      description:
        "Organize checking, savings, and linked accounts into one clean overview of your financial picture.",
      screenshot: "/screenshots/accounts.png",
      icon: Layers,
      stat: "Unified view",
    },
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const selectedFeature = features[selectedFeatureIndex];
  const SelectedIcon = selectedFeature.icon;
  const featureStats = features.map(({ label, stat }) => ({ label, stat }));

  const panelVariants = {
    hidden: {
      opacity: 0,
      y: 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: {
      opacity: 0,
      y: -30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
          className="mb-12 max-w-3xl"
        >
          <span className="font-swiss text-sm font-bold uppercase text-black/50">
            Feature Preview
          </span>
          <h1 className="mt-3 font-swiss text-4xl font-bold leading-tight text-black lg:text-6xl">
            Finance tools that stay out of the way
          </h1>
          <p className="mt-4 font-swiss text-lg leading-8 text-black/65">
            A cleaner preview of the mobile app: fewer distractions, sharper
            hierarchy, and the core workflows visible at a glance.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-start lg:gap-8">
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={panelVariants}
            className="order-2 grid gap-3 lg:order-1"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isSelected = selectedFeatureIndex === index;

              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setSelectedFeatureIndex(index)}
                  onMouseEnter={() => setSelectedFeatureIndex(index)}
                  className={`group grid grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-2xl border p-3 text-left transition-all duration-300 sm:grid-cols-[44px_minmax(0,1fr)] sm:gap-4 sm:p-4 ${
                    isSelected
                      ? "border-black bg-black text-white shadow-xl shadow-black/15"
                      : "border-black/10 bg-white text-black shadow-sm hover:border-black/20 hover:shadow-md"
                  }`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                      isSelected ? "bg-white text-black" : "bg-black/5"
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center justify-between gap-3">
                      <span
                        className={`font-swiss text-sm font-bold uppercase ${
                          isSelected ? "text-white/60" : "text-black/45"
                        }`}
                      >
                        {feature.label}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-swiss text-xs font-bold ${
                          isSelected
                            ? "bg-white/10 text-white"
                            : "bg-black/[0.04] text-black/55"
                        }`}
                      >
                        {feature.stat}
                      </span>
                    </span>
                    <span className="mt-2 block font-swiss text-lg font-bold sm:text-xl">
                      {feature.title}
                    </span>
                    <span
                      className={`mt-2 block font-swiss text-sm leading-6 ${
                        isSelected ? "text-white/70" : "text-black/60"
                      }`}
                    >
                      {feature.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={panelVariants}
            className="order-1 lg:sticky lg:top-24 lg:order-2"
          >
            <motion.div
              key={selectedFeature.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[28px] bg-black p-3 shadow-2xl shadow-black/25 sm:rounded-[32px] sm:p-4"
            >
              <div className="absolute inset-x-0 top-0 h-48 bg-white/10" />
              <div className="relative grid gap-4 rounded-[22px] border border-white/10 bg-[#101211] p-3 sm:rounded-[24px] sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                      <SelectedIcon size={19} />
                    </span>
                    <div>
                      <p className="font-swiss text-xs font-bold uppercase text-white/45">
                        Live Preview
                      </p>
                      <h2 className="font-swiss text-lg font-bold text-white sm:text-xl">
                        {selectedFeature.title}
                      </h2>
                    </div>
                  </div>
                  <span className="self-start rounded-full bg-white/10 px-3 py-1 font-swiss text-xs font-bold text-white/70 sm:self-auto">
                    {selectedFeature.stat}
                  </span>
                </div>

                <div className="mx-auto w-full max-w-[230px] sm:max-w-[300px] lg:max-w-[340px]">
                  <div className="relative aspect-[719/1472] overflow-visible">
                    <Image
                      src={selectedFeature.screenshot}
                      alt={`${selectedFeature.title} screenshot`}
                      fill
                      sizes="(max-width: 1024px) 300px, 320px"
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {featureStats.map(({ label, stat }, index) => {
                    const isSelected = selectedFeature.label === label;

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedFeatureIndex(index)}
                        onMouseEnter={() => setSelectedFeatureIndex(index)}
                        className={`rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/40 ${
                          isSelected
                            ? "border-white/25 bg-white text-black"
                            : "border-white/10 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08]"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <p className="font-swiss text-xs font-bold uppercase opacity-60">
                          {label}
                        </p>
                        <p className="mt-1 font-swiss text-sm font-bold">
                          {stat}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
