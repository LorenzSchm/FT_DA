"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function FeaturePage() {
  const features = [
    {
      title: "Track Expenses & Income",
      description:
        "Effortlessly log your daily transactions with our intuitive interface. Add expenses and income with just a few taps, categorize them for better insights, and watch your financial picture become crystal clear. Stay on top of your cash flow and make informed decisions about your spending habits.",
      screenshotPlaceholder: true,
    },
    {
      title: "Manage Subscriptions",
      description:
        "Never miss a subscription payment again. Keep track of all your recurring expenses in one place, from streaming services to gym memberships. Set reminders, view upcoming charges, and identify subscriptions you might want to cancel to save money.",
      screenshotPlaceholder: true,
    },
    {
      title: "Financial Analytics",
      description:
        "Gain valuable insights into your financial habits with powerful analytics tools. Visualize spending patterns, track budget performance, and discover trends in your financial behavior. Interactive charts and detailed reports help you understand where your money goes and identify opportunities to optimize your finances.",
      screenshotPlaceholder: true,
    },
    {
      title: "Investment Portfolio",
      description:
        "Explore investment opportunities and build your wealth. Browse available investments, analyze performance metrics, and seamlessly add them to your personal portfolio. Monitor your investments' growth and make data-driven decisions to optimize your financial future.",
      screenshotPlaceholder: true,
    },
    {
      title: "Savings Accounts",
      description:
        "Create and manage multiple savings goals with dedicated accounts. Whether you're saving for a vacation, emergency fund, or a major purchase, track your progress visually and stay motivated. Set targets, monitor growth, and celebrate milestones along the way.",
      screenshotPlaceholder: true,
    },
    {
      title: "Account Management",
      description:
        "Add and organize all your financial accounts in one secure location. From checking accounts to credit cards, get a comprehensive overview of your entire financial landscape. Link multiple accounts and see your complete financial picture at a glance.",
      screenshotPlaceholder: true,
    },
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const cardVariants = {
    hidden: (index) => ({
      opacity: 0,
      y: 50,
    }),
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.15,
      },
    }),
    hover: {
      scale: 1.02,
      boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.15)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
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
      id="features"
      className="min-h-screen w-full bg-white py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="text-center mb-16"
        >
          <h1 className="font-swiss font-bold text-4xl lg:text-6xl text-black mb-4">
            Mobile App Features
          </h1>
          <p className="font-swiss text-lg text-gray-600 max-w-2xl mx-auto">
            Discover all the powerful tools designed to help you take control of
            your financial journey
          </p>
        </motion.div>

        <div ref={containerRef} className="space-y-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 items-center bg-white rounded-2xl shadow-lg p-8 hover:cursor-pointer`}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              whileHover="hover"
              custom={index}
            >
              <div className="flex-1 space-y-4">
                <h2 className="font-swiss font-bold text-2xl lg:text-3xl text-black">
                  {feature.title}
                </h2>
                <p className="font-swiss text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="flex-1 w-full">
                {feature.screenshotPlaceholder && (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl aspect-[9/16] max-w-xs mx-auto flex items-center justify-center border-2 border-gray-300">
                    <div className="text-center p-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="font-swiss text-sm text-gray-500">
                        Screenshot Placeholder
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
