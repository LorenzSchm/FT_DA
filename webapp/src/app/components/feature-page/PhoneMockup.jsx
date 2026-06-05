"use client";

import Image from "next/image";

const screenshots = {
  transactions: "/screenshots/tracking_expenses.png",
  subscriptions: "/screenshots/subs.png",
  analytics: "/screenshots/analytics.png",
  investments: "/screenshots/investments.png",
  savings: "/screenshots/savings.png",
  accounts: "/screenshots/accounts.png",
};

export default function PhoneMockup({ screen = "analytics", title = "App preview" }) {
  const src = screenshots[screen] ?? screenshots.analytics;

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -inset-4 rounded-[72px] bg-black/10 blur-2xl" />
      <div className="relative">
        <Image
          src={src}
          alt={title}
          width={719}
          height={1472}
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 300px, 360px"
          className="h-auto w-full object-contain drop-shadow-2xl"
          priority
        />
      </div>
    </div>
  );
}
