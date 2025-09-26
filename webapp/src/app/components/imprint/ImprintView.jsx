"use client";

import Dots from "@/app/components/animations/Dots";
import ImprintTextView from "@/app/components/imprint/text/ImprintTextView";

export default function ImprintView() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative flex min-h-[60vh] flex-col justify-between overflow-hidden px-4 pb-12 pt-20 text-white">
        <div
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          aria-hidden
        />
        <div className="relative flex flex-1 items-center justify-center text-center">
          <h1 className="text-4xl font-swiss font-bold drop-shadow lg:text-5xl">
            Imprint
          </h1>
        </div>
        <div className="relative flex justify-center">
          <Dots className="mt-0 lg:mt-0" />
        </div>
      </section>
      <section className="flex-1 bg-white/90 px-4 py-16 backdrop-blur-sm">
        <ImprintTextView />
      </section>
    </div>
  );
}
