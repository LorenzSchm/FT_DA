"use client";

import Dots from "@/app/components/animations/Dots";
import PrivacyPolicyTextView from "@/app/components/privacy-policy/text/PrivacyPolicyTextView";

export default function PrivacyPolicyView() {
  return (
    <div className="flex flex-col">
      <section className="relative flex h-screen flex-col justify-between overflow-hidden px-4 pb-12 pt-20 text-white">
        <div
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          aria-hidden
        />
        <div className="relative flex items-center justify-center text-center">
          <h1 className="text-4xl font-swiss font-bold drop-shadow lg:text-5xl">
            Privacy Policy
          </h1>
        </div>
        <div className="relative flex justify-center">
          <Dots className="mt-0 lg:mt-0" />
        </div>
      </section>
      <section className=" bg-white/90 px-4 py-16 backdrop-blur-sm h-screen">
        <PrivacyPolicyTextView />
      </section>
    </div>
  );
}
